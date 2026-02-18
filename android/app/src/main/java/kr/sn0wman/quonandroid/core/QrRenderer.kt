package kr.sn0wman.quonandroid.core

import android.graphics.Bitmap
import android.graphics.Canvas
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.MultiFormatWriter

object QrRenderer {
    fun render(
        content: String,
        size: Int,
        margin: Int,
        foreground: Int,
        background: Int,
        logo: Bitmap?,
        logoRatio: Float
    ): Bitmap {
        val matrix = MultiFormatWriter().encode(
            content,
            BarcodeFormat.QR_CODE,
            size,
            size,
            mapOf(EncodeHintType.MARGIN to margin)
        )

        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        for (x in 0 until size) {
            for (y in 0 until size) {
                bitmap.setPixel(x, y, if (matrix[x, y]) foreground else background)
            }
        }

        if (logo == null) return bitmap

        val targetSize = (size * logoRatio).toInt().coerceAtLeast(32)
        val left = (size - targetSize) / 2f
        val top = (size - targetSize) / 2f
        val scaledLogo = Bitmap.createScaledBitmap(logo, targetSize, targetSize, true)
        Canvas(bitmap).drawBitmap(scaledLogo, left, top, null)
        return bitmap
    }
}
