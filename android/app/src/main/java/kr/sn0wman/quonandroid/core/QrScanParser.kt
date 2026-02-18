package kr.sn0wman.quonandroid.core

import java.net.URLDecoder
import java.nio.charset.StandardCharsets

data class ParsedScan(
    val type: QrType,
    val form: QrFormState
)

object QrScanParser {
    fun parse(raw: String): ParsedScan {
        val value = raw.trim()

        if (value.startsWith("WIFI:", ignoreCase = true)) {
            return parseWifi(value)
        }
        if (value.startsWith("BEGIN:VCARD", ignoreCase = true)) {
            return parseVCard(value)
        }
        if (value.startsWith("mailto:", ignoreCase = true)) {
            return parseMailto(value)
        }
        if (value.startsWith("tel:", ignoreCase = true)) {
            return ParsedScan(QrType.TEL, QrFormState(telNumber = value.removePrefix("tel:").trim()))
        }
        if (value.startsWith("http://", ignoreCase = true) || value.startsWith("https://", ignoreCase = true)) {
            return ParsedScan(QrType.URL, QrFormState(url = value))
        }

        return ParsedScan(QrType.TEXT, QrFormState(text = value))
    }

    private fun parseWifi(raw: String): ParsedScan {
        val payload = raw.removePrefix("WIFI:")
        val fields = splitSemicolonAware(payload)
            .mapNotNull { token ->
                val index = token.indexOf(':')
                if (index <= 0) return@mapNotNull null
                token.substring(0, index) to token.substring(index + 1)
            }
            .toMap()

        val ssid = unescapeWifi(fields["S"].orEmpty())
        val password = unescapeWifi(fields["P"].orEmpty())
        val encryption = fields["T"].orEmpty().ifBlank { "WPA" }
        val eapMethod = fields["E"].orEmpty()
        val identity = unescapeWifi(fields["I"].orEmpty())
        val hidden = fields["H"].orEmpty().equals("true", ignoreCase = true)

        val effectiveEncryption = if (eapMethod.isNotBlank()) "$encryption-$eapMethod" else encryption
        val effectivePassword = if (identity.isNotBlank()) {
            listOf(password, "id=$identity").filter { it.isNotBlank() }.joinToString(" | ")
        } else {
            password
        }

        return ParsedScan(
            type = QrType.WIFI,
            form = QrFormState(
                wifiSsid = ssid,
                wifiPassword = effectivePassword,
                wifiEncryption = effectiveEncryption,
                wifiHidden = hidden
            )
        )
    }

    private fun parseVCard(raw: String): ParsedScan {
        val lines = unfoldVCardLines(raw.lines())

        var name = ""
        var org = ""
        var tel = ""
        var email = ""
        var url = ""
        var address = ""

        lines.forEach { line ->
            when {
                line.startsWith("FN:", ignoreCase = true) -> name = unescapeVCard(line.substringAfter(':'))
                line.startsWith("ORG:", ignoreCase = true) -> org = unescapeVCard(line.substringAfter(':'))
                line.startsWith("TEL", ignoreCase = true) -> tel = unescapeVCard(line.substringAfter(':'))
                line.startsWith("EMAIL", ignoreCase = true) -> email = unescapeVCard(line.substringAfter(':'))
                line.startsWith("URL:", ignoreCase = true) -> url = unescapeVCard(line.substringAfter(':'))
                line.startsWith("ADR", ignoreCase = true) -> {
                    val adr = line.substringAfter(':').split(';')
                    if (adr.size >= 3) {
                        address = unescapeVCard(adr[2])
                    }
                }
            }
        }

        return ParsedScan(
            type = QrType.VCARD,
            form = QrFormState(
                fullName = name,
                organization = org,
                vCardTel = tel,
                vCardEmail = email,
                vCardUrl = url,
                vCardAddress = address
            )
        )
    }

    private fun unfoldVCardLines(lines: List<String>): List<String> {
        val unfolded = mutableListOf<String>()
        lines.forEach { original ->
            val line = original.trimEnd('\r')
            if ((line.startsWith(" ") || line.startsWith("\t")) && unfolded.isNotEmpty()) {
                val last = unfolded.removeAt(unfolded.lastIndex)
                unfolded += last + line.trimStart()
            } else {
                unfolded += line.trim()
            }
        }
        return unfolded
    }

    private fun parseMailto(raw: String): ParsedScan {
        val mailtoBody = raw.removePrefix("mailto:")
        val to = mailtoBody.substringBefore('?')
        val query = mailtoBody.substringAfter('?', "")

        val queryMap = query.split('&')
            .mapNotNull { token ->
                val index = token.indexOf('=')
                if (index <= 0) return@mapNotNull null
                val key = token.substring(0, index)
                val value = token.substring(index + 1)
                key to decode(value)
            }
            .toMap()

        return ParsedScan(
            type = QrType.EMAIL,
            form = QrFormState(
                emailTo = decode(to),
                emailSubject = queryMap["subject"].orEmpty(),
                emailBody = queryMap["body"].orEmpty()
            )
        )
    }

    private fun splitSemicolonAware(payload: String): List<String> {
        val chunks = mutableListOf<String>()
        val current = StringBuilder()
        var escaped = false
        payload.forEach { ch ->
            when {
                escaped -> {
                    current.append(ch)
                    escaped = false
                }
                ch == '\\' -> {
                    current.append(ch)
                    escaped = true
                }
                ch == ';' -> {
                    chunks += current.toString()
                    current.clear()
                }
                else -> current.append(ch)
            }
        }
        if (current.isNotEmpty()) chunks += current.toString()
        return chunks
    }

    private fun unescapeWifi(value: String): String {
        return value
            .replace("\\:", ":")
            .replace("\\;", ";")
            .replace("\\,", ",")
            .replace("\\\\", "\\")
    }

    private fun unescapeVCard(value: String): String {
        return value
            .replace("\\n", "\n")
            .replace("\\,", ",")
            .replace("\\;", ";")
            .replace("\\\\", "\\")
    }

    private fun decode(value: String): String {
        return URLDecoder.decode(value, StandardCharsets.UTF_8)
    }
}
