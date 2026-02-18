package kr.sn0wman.quonandroid.core

import java.net.URLEncoder
import java.nio.charset.StandardCharsets

sealed class QrContentResult {
    data class Success(val content: String) : QrContentResult()
    data class Error(val reason: ValidationReason) : QrContentResult()
}

enum class ValidationReason {
    URL_REQUIRED,
    URL_INVALID,
    TEXT_REQUIRED,
    VCARD_NAME_REQUIRED,
    VCARD_PHONE_REQUIRED,
    VCARD_EMAIL_INVALID,
    EMAIL_TO_REQUIRED,
    EMAIL_TO_INVALID,
    TEL_REQUIRED,
    WIFI_SSID_REQUIRED
}

object QrContentBuilder {
    fun build(type: QrType, form: QrFormState): QrContentResult {
        return when (type) {
            QrType.URL -> buildUrl(form.url)
            QrType.TEXT -> buildText(form.text)
            QrType.VCARD -> buildVCard(form)
            QrType.EMAIL -> buildEmail(form)
            QrType.TEL -> buildTel(form.telNumber)
            QrType.WIFI -> buildWifi(form)
        }
    }

    private fun buildUrl(raw: String): QrContentResult {
        val value = raw.trim()
        if (value.isBlank()) return QrContentResult.Error(ValidationReason.URL_REQUIRED)

        val normalized = if (value.startsWith("http://") || value.startsWith("https://")) value else "https://$value"
        val urlRegex = Regex("^https?://[^\\s/$.?#].[^\\s]*$", RegexOption.IGNORE_CASE)
        return if (urlRegex.matches(normalized)) {
            QrContentResult.Success(normalized)
        } else {
            QrContentResult.Error(ValidationReason.URL_INVALID)
        }
    }

    private fun buildText(raw: String): QrContentResult {
        val value = raw.trim()
        return if (value.isBlank()) {
            QrContentResult.Error(ValidationReason.TEXT_REQUIRED)
        } else {
            QrContentResult.Success(value)
        }
    }

    private fun buildVCard(form: QrFormState): QrContentResult {
        val name = form.fullName.trim()
        val tel = form.vCardTel.trim()
        val email = form.vCardEmail.trim()
        if (name.isBlank()) return QrContentResult.Error(ValidationReason.VCARD_NAME_REQUIRED)
        if (tel.isBlank()) return QrContentResult.Error(ValidationReason.VCARD_PHONE_REQUIRED)
        if (email.isNotBlank() && !isEmail(email)) return QrContentResult.Error(ValidationReason.VCARD_EMAIL_INVALID)

        val content = buildString {
            appendLine("BEGIN:VCARD")
            appendLine("VERSION:3.0")
            appendLine("FN:${escapeVCard(name)}")
            appendLine("TEL;TYPE=CELL:${escapeVCard(tel)}")
            if (form.organization.isNotBlank()) appendLine("ORG:${escapeVCard(form.organization.trim())}")
            if (email.isNotBlank()) appendLine("EMAIL:${escapeVCard(email)}")
            if (form.vCardUrl.isNotBlank()) appendLine("URL:${escapeVCard(form.vCardUrl.trim())}")
            if (form.vCardAddress.isNotBlank()) appendLine("ADR:;;${escapeVCard(form.vCardAddress.trim())};;;;")
            append("END:VCARD")
        }
        return QrContentResult.Success(content)
    }

    private fun buildEmail(form: QrFormState): QrContentResult {
        val to = form.emailTo.trim()
        if (to.isBlank()) return QrContentResult.Error(ValidationReason.EMAIL_TO_REQUIRED)
        if (!isEmail(to)) return QrContentResult.Error(ValidationReason.EMAIL_TO_INVALID)

        val params = mutableListOf<String>()
        if (form.emailSubject.isNotBlank()) params += "subject=${urlEncode(form.emailSubject.trim())}"
        if (form.emailBody.isNotBlank()) params += "body=${urlEncode(form.emailBody.trim())}"
        val content = if (params.isEmpty()) "mailto:$to" else "mailto:$to?${params.joinToString("&")}" 
        return QrContentResult.Success(content)
    }

    private fun buildTel(raw: String): QrContentResult {
        val tel = raw.trim()
        return if (tel.isBlank()) {
            QrContentResult.Error(ValidationReason.TEL_REQUIRED)
        } else {
            QrContentResult.Success("tel:$tel")
        }
    }

    private fun buildWifi(form: QrFormState): QrContentResult {
        val ssid = form.wifiSsid.trim()
        if (ssid.isBlank()) return QrContentResult.Error(ValidationReason.WIFI_SSID_REQUIRED)
        val encryption = form.wifiEncryption.trim().ifBlank { "WPA" }
        val content = "WIFI:T:$encryption;S:${escapeWifi(ssid)};P:${escapeWifi(form.wifiPassword.trim())};${if (form.wifiHidden) "H:true;" else ""};"
        return QrContentResult.Success(content)
    }

    fun escapeVCard(value: String): String {
        return value.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n")
    }

    fun escapeWifi(value: String): String {
        return value.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace(":", "\\:")
    }

    private fun isEmail(value: String): Boolean {
        val regex = Regex("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$")
        return regex.matches(value)
    }

    private fun urlEncode(value: String): String {
        return URLEncoder.encode(value, StandardCharsets.UTF_8)
    }
}
