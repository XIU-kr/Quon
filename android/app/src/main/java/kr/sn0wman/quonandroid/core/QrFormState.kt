package kr.sn0wman.quonandroid.core

data class QrFormState(
    val url: String = "",
    val text: String = "",
    val fullName: String = "",
    val organization: String = "",
    val vCardTel: String = "",
    val vCardEmail: String = "",
    val vCardUrl: String = "",
    val vCardAddress: String = "",
    val emailTo: String = "",
    val emailSubject: String = "",
    val emailBody: String = "",
    val telNumber: String = "",
    val wifiSsid: String = "",
    val wifiPassword: String = "",
    val wifiEncryption: String = "WPA",
    val wifiHidden: Boolean = false
)
