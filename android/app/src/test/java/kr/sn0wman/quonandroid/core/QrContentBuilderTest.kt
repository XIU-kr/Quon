package kr.sn0wman.quonandroid.core

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class QrContentBuilderTest {

    @Test
    fun buildUrl_addsHttpsSchemeWhenMissing() {
        val form = QrFormState(url = "example.com")
        val result = QrContentBuilder.build(QrType.URL, form)

        assertTrue(result is QrContentResult.Success)
        assertEquals("https://example.com", (result as QrContentResult.Success).content)
    }

    @Test
    fun escapeWifi_escapesReservedCharacters() {
        val escaped = QrContentBuilder.escapeWifi("Cafe;WiFi:2.4G,Guest\\A")
        assertEquals("Cafe\\;WiFi\\:2.4G\\,Guest\\\\A", escaped)
    }
}
