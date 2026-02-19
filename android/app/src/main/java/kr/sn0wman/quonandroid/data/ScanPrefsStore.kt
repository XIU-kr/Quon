package kr.sn0wman.quonandroid.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kr.sn0wman.quonandroid.core.QrType

private val Context.scanPrefsDataStore: DataStore<Preferences> by preferencesDataStore(name = "scan_prefs")

class ScanPrefsStore(private val context: Context) {
    private val keyAutoApply = booleanPreferencesKey("scan_auto_apply")
    private val keyLastType = stringPreferencesKey("scan_last_type")
    private val keyAdsRemoved = booleanPreferencesKey("ads_removed")

    suspend fun readAutoApply(defaultValue: Boolean = true): Boolean {
        return context.scanPrefsDataStore.data.map { it[keyAutoApply] ?: defaultValue }.first()
    }

    suspend fun writeAutoApply(value: Boolean) {
        context.scanPrefsDataStore.edit { prefs ->
            prefs[keyAutoApply] = value
        }
    }

    suspend fun readLastType(): QrType? {
        val raw = context.scanPrefsDataStore.data.map { it[keyLastType] }.first() ?: return null
        return runCatching { QrType.valueOf(raw) }.getOrNull()
    }

    suspend fun writeLastType(type: QrType) {
        context.scanPrefsDataStore.edit { prefs ->
            prefs[keyLastType] = type.name
        }
    }

    suspend fun readAdsRemoved(defaultValue: Boolean = false): Boolean {
        return context.scanPrefsDataStore.data.map { it[keyAdsRemoved] ?: defaultValue }.first()
    }

    suspend fun writeAdsRemoved(value: Boolean) {
        context.scanPrefsDataStore.edit { prefs ->
            prefs[keyAdsRemoved] = value
        }
    }
}
