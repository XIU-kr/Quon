package kr.sn0wman.quonandroid.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class QrScanParserTest {

    @Test
    fun parse_wifiPayload_mapsToWifiForm() {
        val payload = "WIFI:T:WPA;S:MyWifi;P:pass123;H:true;;"
        val parsed = QrScanParser.parse(payload)

        assertEquals(QrType.WIFI, parsed.type)
        assertEquals("MyWifi", parsed.form.wifiSsid)
        assertEquals("pass123", parsed.form.wifiPassword)
        assertEquals("WPA", parsed.form.wifiEncryption)
        assertTrue(parsed.form.wifiHidden)
    }

    @Test
    fun parse_mailto_mapsToEmailForm() {
        val payload = "mailto:abc@example.com?subject=Hello&body=Line1%20Line2"
        val parsed = QrScanParser.parse(payload)

        assertEquals(QrType.EMAIL, parsed.type)
        assertEquals("abc@example.com", parsed.form.emailTo)
        assertEquals("Hello", parsed.form.emailSubject)
        assertEquals("Line1 Line2", parsed.form.emailBody)
    }

    @Test
    fun parse_vcard_withFoldedLines_unfoldsAndParses() {
        val payload = """
            BEGIN:VCARD
            VERSION:3.0
            FN:Kim
             Minsoo
            TEL;TYPE=CELL:+821012345678
            EMAIL:minsoo@example.com
            END:VCARD
        """.trimIndent()

        val parsed = QrScanParser.parse(payload)
        assertEquals(QrType.VCARD, parsed.type)
        assertEquals("KimMinsoo", parsed.form.fullName)
        assertEquals("+821012345678", parsed.form.vCardTel)
        assertEquals("minsoo@example.com", parsed.form.vCardEmail)
    }

    @Test
    fun parse_wifiEap_includesEapAndIdentity() {
        val payload = "WIFI:T:WPA2;S:Corp;P:secret;E:TTLS;I:user01;H:false;;"
        val parsed = QrScanParser.parse(payload)

        assertEquals(QrType.WIFI, parsed.type)
        assertEquals("WPA2-TTLS", parsed.form.wifiEncryption)
        assertEquals("secret | id=user01", parsed.form.wifiPassword)
    }
}
