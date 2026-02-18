package kr.sn0wman.quonandroid

import android.content.Context
import android.graphics.Bitmap
import android.os.SystemClock
import androidx.annotation.StringRes
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kr.sn0wman.quonandroid.core.ImageStore
import kr.sn0wman.quonandroid.core.QrContentBuilder
import kr.sn0wman.quonandroid.core.QrContentResult
import kr.sn0wman.quonandroid.core.QrPalette
import kr.sn0wman.quonandroid.core.QrRenderer
import kr.sn0wman.quonandroid.core.QrScanParser
import kr.sn0wman.quonandroid.core.QrType
import kr.sn0wman.quonandroid.core.SaveResult
import kr.sn0wman.quonandroid.core.ValidationReason
import kotlinx.coroutines.launch

sealed class UiEvent {
    data class Message(@StringRes val resId: Int, val path: String? = null, val openSaved: SaveResult? = null) : UiEvent()
    data class ScanApplied(val type: QrType) : UiEvent()
}

class MainViewModel : ViewModel() {
    private val _uiState = MutableStateFlow(MainUiState())
    val uiState: StateFlow<MainUiState> = _uiState.asStateFlow()

    private val _events = MutableSharedFlow<UiEvent>()
    val events: SharedFlow<UiEvent> = _events.asSharedFlow()

    private var lastScanCancelledAt: Long = 0L

    val palettes = listOf(
        QrPalette("Midnight", 0xFF111318.toInt(), android.graphics.Color.WHITE),
        QrPalette("Mint Dark", 0xFF6DE0B1.toInt(), 0xFF0C111C.toInt()),
        QrPalette("Amber Noir", 0xFFFFC357.toInt(), 0xFF121319.toInt()),
        QrPalette("Ice", 0xFF1B3A6D.toInt(), 0xFFF4F8FF.toInt())
    )

    fun setType(type: QrType) = _uiState.update { it.copy(type = type) }
    fun setAutoApplyScan(value: Boolean) = _uiState.update { it.copy(autoApplyScan = value) }
    fun setZoom(value: Float) = _uiState.update { it.copy(zoom = value.coerceIn(0.7f, 1.8f)) }
    fun zoomIn() = setZoom(_uiState.value.zoom + 0.1f)
    fun zoomOut() = setZoom(_uiState.value.zoom - 0.1f)
    fun zoomReset() = setZoom(1f)
    fun setQrSize(value: Float) = _uiState.update { it.copy(qrSize = value) }
    fun setMargin(value: Float) = _uiState.update { it.copy(margin = value) }
    fun setLogoSize(value: Float) = _uiState.update { it.copy(logoSize = value) }
    fun setPalette(palette: QrPalette) = _uiState.update { it.copy(fgColor = palette.foreground, bgColor = palette.background) }
    fun setLogo(bitmap: Bitmap?) = _uiState.update { it.copy(logoBitmap = bitmap) }

    fun updateUrl(value: String) = _uiState.update { it.copy(form = it.form.copy(url = value)) }
    fun updateText(value: String) = _uiState.update { it.copy(form = it.form.copy(text = value)) }
    fun updateFullName(value: String) = _uiState.update { it.copy(form = it.form.copy(fullName = value)) }
    fun updateOrganization(value: String) = _uiState.update { it.copy(form = it.form.copy(organization = value)) }
    fun updateVCardTel(value: String) = _uiState.update { it.copy(form = it.form.copy(vCardTel = value)) }
    fun updateVCardEmail(value: String) = _uiState.update { it.copy(form = it.form.copy(vCardEmail = value)) }
    fun updateVCardUrl(value: String) = _uiState.update { it.copy(form = it.form.copy(vCardUrl = value)) }
    fun updateVCardAddress(value: String) = _uiState.update { it.copy(form = it.form.copy(vCardAddress = value)) }
    fun updateEmailTo(value: String) = _uiState.update { it.copy(form = it.form.copy(emailTo = value)) }
    fun updateEmailSubject(value: String) = _uiState.update { it.copy(form = it.form.copy(emailSubject = value)) }
    fun updateEmailBody(value: String) = _uiState.update { it.copy(form = it.form.copy(emailBody = value)) }
    fun updateTelNumber(value: String) = _uiState.update { it.copy(form = it.form.copy(telNumber = value)) }
    fun updateWifiSsid(value: String) = _uiState.update { it.copy(form = it.form.copy(wifiSsid = value)) }
    fun updateWifiPassword(value: String) = _uiState.update { it.copy(form = it.form.copy(wifiPassword = value)) }
    fun updateWifiEncryption(value: String) = _uiState.update { it.copy(form = it.form.copy(wifiEncryption = value)) }
    fun updateWifiHidden(value: Boolean) = _uiState.update { it.copy(form = it.form.copy(wifiHidden = value)) }

    fun generate() {
        val state = _uiState.value
        when (val result = QrContentBuilder.build(state.type, state.form)) {
            is QrContentResult.Error -> emitValidationError(result.reason)
            is QrContentResult.Success -> {
                val bitmap = QrRenderer.render(
                    content = result.content,
                    size = state.qrSize.toInt(),
                    margin = state.margin.toInt(),
                    foreground = state.fgColor,
                    background = state.bgColor,
                    logo = state.logoBitmap,
                    logoRatio = state.logoSize
                )
                _uiState.update { it.copy(qrBitmap = bitmap) }
            }
        }
    }

    fun save(context: Context) {
        val bitmap = _uiState.value.qrBitmap ?: run {
            viewModelScope.launch { _events.emit(UiEvent.Message(R.string.error_generate_first)) }
            return
        }

        val result = ImageStore.savePng(context, bitmap)
        viewModelScope.launch {
            if (result == null) {
                _events.emit(UiEvent.Message(R.string.save_failed))
            } else {
                _events.emit(
                    UiEvent.Message(
                        resId = R.string.saved_with_path,
                        path = "${result.relativePath}/${result.filename}",
                        openSaved = result
                    )
                )
            }
        }
    }

    fun applyScan(raw: String) {
        val parsed = QrScanParser.parse(raw)
        val shouldAutoApply = _uiState.value.autoApplyScan
        _uiState.update { state ->
            state.copy(
                type = parsed.type,
                form = parsed.form
            )
        }

        if (shouldAutoApply) {
            generate()
        }

        viewModelScope.launch {
            _events.emit(UiEvent.ScanApplied(parsed.type))
            _events.emit(UiEvent.Message(if (shouldAutoApply) R.string.scan_applied else R.string.scan_applied_review))
        }
    }

    fun onScanCancelled() {
        val now = SystemClock.elapsedRealtime()
        if (now - lastScanCancelledAt < 2000L) {
            return
        }
        lastScanCancelledAt = now
        viewModelScope.launch { _events.emit(UiEvent.Message(R.string.scan_cancelled)) }
    }

    private fun emitValidationError(reason: ValidationReason) {
        val resId = when (reason) {
            ValidationReason.URL_REQUIRED -> R.string.error_url_required
            ValidationReason.URL_INVALID -> R.string.error_url_invalid
            ValidationReason.TEXT_REQUIRED -> R.string.error_text_required
            ValidationReason.VCARD_NAME_REQUIRED -> R.string.error_vcard_name_required
            ValidationReason.VCARD_PHONE_REQUIRED -> R.string.error_vcard_phone_required
            ValidationReason.VCARD_EMAIL_INVALID -> R.string.error_vcard_email_invalid
            ValidationReason.EMAIL_TO_REQUIRED -> R.string.error_email_to_required
            ValidationReason.EMAIL_TO_INVALID -> R.string.error_email_to_invalid
            ValidationReason.TEL_REQUIRED -> R.string.error_tel_required
            ValidationReason.WIFI_SSID_REQUIRED -> R.string.error_wifi_ssid_required
        }
        viewModelScope.launch { _events.emit(UiEvent.Message(resId)) }
    }
}
