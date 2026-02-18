package kr.sn0wman.quonandroid

import android.os.Bundle
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.QrCodeScanner
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Remove
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.SnackbarDuration
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.flow.collectLatest
import kr.sn0wman.quonandroid.core.ImageStore
import kr.sn0wman.quonandroid.core.QrPalette
import kr.sn0wman.quonandroid.core.QrType
import com.journeyapps.barcodescanner.ScanContract
import com.journeyapps.barcodescanner.ScanOptions

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent { QuonNativeApp() }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuonNativeApp(vm: MainViewModel = viewModel()) {
    val ui by vm.uiState.collectAsState()
    val context = LocalContext.current
    val focusManager = LocalFocusManager.current
    val snackHost = remember { SnackbarHostState() }
    var previewPulse by remember { mutableStateOf(false) }
    var focusType by remember { mutableStateOf<QrType?>(null) }

    fun triggerScanFeedback(type: QrType) {
        previewPulse = true
        focusType = type
        val vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val manager = context.getSystemService(VibratorManager::class.java)
            manager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Vibrator::class.java)
        }
        vibrator?.vibrate(VibrationEffect.createOneShot(70, VibrationEffect.DEFAULT_AMPLITUDE))
    }

    val logoPicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        vm.setLogo(uri?.let { ImageStore.decode(context, it) })
    }

    val scanLauncher = rememberLauncherForActivityResult(ScanContract()) { result ->
        val payload = result.contents
        if (payload.isNullOrBlank()) {
            vm.onScanCancelled()
        } else {
            vm.applyScan(payload)
        }
    }

    LaunchedEffect(Unit) {
        vm.events.collectLatest { event ->
            when (event) {
                is UiEvent.Message -> {
                    val text = if (event.path == null) {
                        context.getString(event.resId)
                    } else {
                        context.getString(event.resId, event.path)
                    }
                    val action = if (event.openSaved != null) context.getString(R.string.open_saved) else null
                    val result = snackHost.showSnackbar(
                        message = text,
                        actionLabel = action,
                        duration = SnackbarDuration.Short
                    )
                    if (result == androidx.compose.material3.SnackbarResult.ActionPerformed && event.openSaved != null) {
                        ImageStore.openImage(context, event.openSaved.uri)
                    }
                }
                is UiEvent.ScanApplied -> triggerScanFeedback(event.type)
            }
        }
    }

    LaunchedEffect(previewPulse) {
        if (previewPulse) {
            kotlinx.coroutines.delay(420)
            previewPulse = false
        }
    }

    MaterialTheme(colorScheme = darkColorScheme()) {
        Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Scaffold(
                snackbarHost = { SnackbarHost(hostState = snackHost) },
                topBar = {
                    TopAppBar(
                        title = { Text(stringResource(R.string.app_name)) },
                        colors = TopAppBarDefaults.topAppBarColors(),
                        modifier = Modifier.statusBarsPadding(),
                        actions = {
                            FilterChip(
                                selected = ui.autoApplyScan,
                                onClick = {
                                    focusManager.clearFocus(force = true)
                                    vm.setAutoApplyScan(!ui.autoApplyScan)
                                },
                                label = { Text(stringResource(R.string.scan_auto_apply)) },
                                colors = FilterChipDefaults.filterChipColors(),
                                modifier = Modifier.padding(end = 6.dp)
                            )

                            AssistChip(onClick = {
                                val options = ScanOptions().apply {
                                    setDesiredBarcodeFormats(ScanOptions.QR_CODE)
                                    setPrompt(context.getString(R.string.scan_prompt))
                                    setBeepEnabled(true)
                                    setOrientationLocked(false)
                                    setBarcodeImageEnabled(false)
                                }
                                scanLauncher.launch(options)
                            }, label = { Text(stringResource(R.string.action_scan_qr)) }, leadingIcon = {
                                Icon(Icons.Default.QrCodeScanner, null)
                            })
                        }
                    )
                }
            ) { padding ->
                BoxWithConstraints(modifier = Modifier.fillMaxSize().padding(padding).padding(12.dp)) {
                    val wide = maxWidth > 980.dp
                    if (wide) {
                        Row(modifier = Modifier.fillMaxSize(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                            LeftPanel(modifier = Modifier.weight(0.9f), ui = ui, vm = vm, focusType = focusType)
                            PreviewPanel(modifier = Modifier.weight(1.35f), ui = ui, vm = vm, pulse = previewPulse)
                            RightPanel(modifier = Modifier.weight(0.85f), ui = ui, palettes = vm.palettes, vm = vm, onPickLogo = {
                                logoPicker.launch("image/*")
                            })
                        }
                    } else {
                        Column(
                            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()),
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            PreviewPanel(modifier = Modifier.fillMaxWidth(), ui = ui, vm = vm, pulse = previewPulse)
                            LeftPanel(modifier = Modifier.fillMaxWidth(), ui = ui, vm = vm, focusType = focusType)
                            RightPanel(modifier = Modifier.fillMaxWidth(), ui = ui, palettes = vm.palettes, vm = vm, onPickLogo = {
                                logoPicker.launch("image/*")
                            })
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun LeftPanel(modifier: Modifier, ui: MainUiState, vm: MainViewModel, focusType: QrType?) {
    val urlFocus = remember { FocusRequester() }
    val textFocus = remember { FocusRequester() }
    val nameFocus = remember { FocusRequester() }
    val emailToFocus = remember { FocusRequester() }
    val telFocus = remember { FocusRequester() }
    val wifiFocus = remember { FocusRequester() }

    LaunchedEffect(focusType) {
        when (focusType) {
            QrType.URL -> urlFocus.requestFocus()
            QrType.TEXT -> textFocus.requestFocus()
            QrType.VCARD -> nameFocus.requestFocus()
            QrType.EMAIL -> emailToFocus.requestFocus()
            QrType.TEL -> telFocus.requestFocus()
            QrType.WIFI -> wifiFocus.requestFocus()
            null -> Unit
        }
    }

    ElevatedCard(modifier = modifier, colors = CardDefaults.elevatedCardColors()) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(stringResource(R.string.label_code_type), fontWeight = FontWeight.Bold)

            Row(modifier = Modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                QrType.entries.forEach { type ->
                    AssistChip(
                        onClick = { vm.setType(type) },
                        label = { Text(typeLabel(type)) },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = if (ui.type == type) MaterialTheme.colorScheme.primaryContainer else MaterialTheme.colorScheme.surfaceVariant
                        )
                    )
                }
            }

            when (ui.type) {
                QrType.URL -> Field(stringResource(R.string.field_url), ui.form.url, vm::updateUrl, focusRequester = urlFocus)
                QrType.TEXT -> Field(stringResource(R.string.field_text), ui.form.text, vm::updateText, minLines = 4, focusRequester = textFocus)
                QrType.VCARD -> {
                    Field(stringResource(R.string.field_full_name), ui.form.fullName, vm::updateFullName, focusRequester = nameFocus)
                    Field(stringResource(R.string.field_organization), ui.form.organization, vm::updateOrganization)
                    Field(stringResource(R.string.field_phone), ui.form.vCardTel, vm::updateVCardTel)
                    Field(stringResource(R.string.field_email), ui.form.vCardEmail, vm::updateVCardEmail)
                    Field(stringResource(R.string.field_website), ui.form.vCardUrl, vm::updateVCardUrl)
                    Field(stringResource(R.string.field_address), ui.form.vCardAddress, vm::updateVCardAddress, minLines = 2)
                }

                QrType.EMAIL -> {
                    Field(stringResource(R.string.field_recipient), ui.form.emailTo, vm::updateEmailTo, focusRequester = emailToFocus)
                    Field(stringResource(R.string.field_subject), ui.form.emailSubject, vm::updateEmailSubject)
                    Field(stringResource(R.string.field_body), ui.form.emailBody, vm::updateEmailBody, minLines = 4)
                }

                QrType.TEL -> Field(stringResource(R.string.field_phone), ui.form.telNumber, vm::updateTelNumber, focusRequester = telFocus)
                QrType.WIFI -> {
                    Field(stringResource(R.string.field_ssid), ui.form.wifiSsid, vm::updateWifiSsid, focusRequester = wifiFocus)
                    Field(stringResource(R.string.field_password), ui.form.wifiPassword, vm::updateWifiPassword)
                    Field(stringResource(R.string.field_encryption), ui.form.wifiEncryption, vm::updateWifiEncryption)
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(stringResource(R.string.field_hidden_network))
                        Spacer(modifier = Modifier.width(8.dp))
                        TextButton(onClick = { vm.updateWifiHidden(!ui.form.wifiHidden) }) {
                            Text(if (ui.form.wifiHidden) stringResource(R.string.common_yes) else stringResource(R.string.common_no))
                        }
                    }
                }
            }

            Button(onClick = vm::generate, modifier = Modifier.fillMaxWidth()) {
                Text(stringResource(R.string.action_generate_qr))
            }
        }
    }
}

@Composable
private fun PreviewPanel(modifier: Modifier, ui: MainUiState, vm: MainViewModel, pulse: Boolean) {
    val context = LocalContext.current
    val pulseBorder by animateColorAsState(
        targetValue = if (pulse) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outlineVariant,
        animationSpec = tween(durationMillis = 240),
        label = "previewPulse"
    )

    ElevatedCard(modifier = modifier) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
                Text(stringResource(R.string.label_qr_preview), fontWeight = FontWeight.Bold)
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = vm::zoomOut) { Icon(Icons.Default.Remove, null) }
                    Text("${(ui.zoom * 100).toInt()}%", fontSize = 12.sp)
                    IconButton(onClick = vm::zoomIn) { Icon(Icons.Default.Add, null) }
                    IconButton(onClick = vm::zoomReset) { Icon(Icons.Default.Refresh, null) }
                }
            }

            Box(
                modifier = Modifier.fillMaxWidth().height(420.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(MaterialTheme.colorScheme.surfaceVariant)
                    .border(2.dp, pulseBorder, RoundedCornerShape(18.dp)),
                contentAlignment = Alignment.Center
            ) {
                if (ui.qrBitmap == null) {
                    Text(
                        stringResource(R.string.preview_empty),
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textAlign = TextAlign.Center
                    )
                } else {
                    Image(bitmap = ui.qrBitmap.asImageBitmap(), contentDescription = null, modifier = Modifier.size((300 * ui.zoom).dp))
                }
            }

            OutlinedButton(onClick = { vm.save(context) }, enabled = ui.qrBitmap != null, modifier = Modifier.fillMaxWidth()) {
                Icon(Icons.Default.Download, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text(stringResource(R.string.action_save_png))
            }
        }
    }
}

@Composable
private fun RightPanel(modifier: Modifier, ui: MainUiState, palettes: List<QrPalette>, vm: MainViewModel, onPickLogo: () -> Unit) {
    ElevatedCard(modifier = modifier) {
        Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(stringResource(R.string.label_design_studio), fontWeight = FontWeight.Bold)

            Text(stringResource(R.string.label_palette), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.horizontalScroll(rememberScrollState())) {
                palettes.forEach { palette ->
                    Card(onClick = { vm.setPalette(palette) }) {
                        Row(modifier = Modifier.padding(horizontal = 10.dp, vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier.size(14.dp).clip(CircleShape)
                                    .background(Color(palette.foreground))
                                    .border(1.dp, MaterialTheme.colorScheme.outline, CircleShape)
                            )
                            Spacer(Modifier.width(6.dp))
                            Text(palette.label, fontSize = 12.sp)
                        }
                    }
                }
            }

            ColorReadout("FG", ui.fgColor)
            ColorReadout("BG", ui.bgColor)

            SliderItem(stringResource(R.string.label_qr_resolution), ui.qrSize, 480f..1500f, vm::setQrSize)
            SliderItem(stringResource(R.string.label_margin), ui.margin, 0f..8f, vm::setMargin)
            SliderItem(stringResource(R.string.label_logo_ratio), ui.logoSize, 0.12f..0.33f, vm::setLogoSize)

            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                OutlinedButton(onClick = onPickLogo, modifier = Modifier.weight(1f)) {
                    Text(stringResource(R.string.action_pick_logo))
                }
                OutlinedButton(onClick = { vm.setLogo(null) }, modifier = Modifier.weight(1f)) {
                    Text(stringResource(R.string.action_clear_logo))
                }
            }

            Button(onClick = vm::generate, modifier = Modifier.fillMaxWidth()) {
                Text(stringResource(R.string.action_apply_regenerate))
            }
        }
    }
}

@Composable
private fun Field(
    label: String,
    value: String,
    onValue: (String) -> Unit,
    minLines: Int = 1,
    focusRequester: FocusRequester? = null
) {
    OutlinedTextField(
        value = value,
        onValueChange = onValue,
        label = { Text(label) },
        modifier = if (focusRequester != null) Modifier.fillMaxWidth().focusRequester(focusRequester) else Modifier.fillMaxWidth(),
        minLines = minLines,
        maxLines = if (minLines > 1) 6 else 1
    )
}

@Composable
private fun SliderItem(label: String, value: Float, range: ClosedFloatingPointRange<Float>, onValue: (Float) -> Unit) {
    Column {
        Text("$label: ${"%.2f".format(value)}", fontSize = 12.sp)
        Slider(value = value, onValueChange = onValue, valueRange = range)
    }
}

@Composable
private fun ColorReadout(label: String, colorInt: Int) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier.size(16.dp).clip(CircleShape)
                .background(Color(colorInt))
                .border(1.dp, MaterialTheme.colorScheme.outline, CircleShape)
        )
        Spacer(modifier = Modifier.width(8.dp))
        Text("$label #${Integer.toHexString(colorInt).uppercase().takeLast(6)}", fontSize = 12.sp)
    }
}

@Composable
private fun typeLabel(type: QrType): String {
    return when (type) {
        QrType.URL -> stringResource(R.string.type_url)
        QrType.TEXT -> stringResource(R.string.type_text)
        QrType.VCARD -> stringResource(R.string.type_contact)
        QrType.EMAIL -> stringResource(R.string.type_email)
        QrType.TEL -> stringResource(R.string.type_phone)
        QrType.WIFI -> stringResource(R.string.type_wifi)
    }
}

private fun darkColorScheme() = androidx.compose.material3.darkColorScheme(
    primary = Color(0xFF6DE0B1),
    onPrimary = Color(0xFF062016),
    primaryContainer = Color(0xFF133C2E),
    background = Color(0xFF090C13),
    surface = Color(0xFF111826),
    surfaceVariant = Color(0xFF1A2438),
    onSurface = Color(0xFFE7EEFF),
    onSurfaceVariant = Color(0xFFA9BAD8),
    outlineVariant = Color(0xFF2C3955)
)
