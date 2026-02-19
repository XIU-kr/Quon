package kr.sn0wman.quonandroid

import android.graphics.Bitmap
import kr.sn0wman.quonandroid.core.QrFormState
import kr.sn0wman.quonandroid.core.QrType

data class MainUiState(
    val type: QrType = QrType.URL,
    val form: QrFormState = QrFormState(),
    val qrBitmap: Bitmap? = null,
    val logoBitmap: Bitmap? = null,
    val adsRemoved: Boolean = false,
    val autoApplyScan: Boolean = true,
    val zoom: Float = 1f,
    val qrSize: Float = 900f,
    val margin: Float = 2f,
    val logoSize: Float = 0.22f,
    val fgColor: Int = 0xFF111318.toInt(),
    val bgColor: Int = android.graphics.Color.WHITE
)
