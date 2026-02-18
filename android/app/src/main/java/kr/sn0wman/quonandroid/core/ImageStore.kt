package kr.sn0wman.quonandroid.core

import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.graphics.Bitmap
import android.graphics.ImageDecoder
import android.net.Uri
import android.provider.MediaStore
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

data class SaveResult(
    val uri: Uri,
    val relativePath: String,
    val filename: String
)

object ImageStore {
    fun decode(context: Context, uri: Uri): Bitmap? {
        return runCatching {
            val source = ImageDecoder.createSource(context.contentResolver, uri)
            ImageDecoder.decodeBitmap(source)
        }.getOrNull()
    }

    fun savePng(context: Context, bitmap: Bitmap): SaveResult? {
        return runCatching {
            val filename = "quon-${SimpleDateFormat("yyyyMMdd-HHmmss", Locale.US).format(Date())}.png"
            val relativePath = "Pictures/Quon"

            val values = ContentValues().apply {
                put(MediaStore.Images.Media.DISPLAY_NAME, filename)
                put(MediaStore.Images.Media.MIME_TYPE, "image/png")
                put(MediaStore.Images.Media.RELATIVE_PATH, relativePath)
            }

            val uri = context.contentResolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
                ?: return null
            context.contentResolver.openOutputStream(uri)?.use { out ->
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
            }

            SaveResult(uri = uri, relativePath = relativePath, filename = filename)
        }.getOrNull()
    }

    fun openImage(context: Context, uri: Uri) {
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "image/png")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(intent, null))
    }
}
