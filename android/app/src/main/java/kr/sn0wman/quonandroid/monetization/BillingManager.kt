package kr.sn0wman.quonandroid.monetization

import android.app.Activity
import android.content.Context
import com.android.billingclient.api.AcknowledgePurchaseParams
import com.android.billingclient.api.BillingClient
import com.android.billingclient.api.BillingClientStateListener
import com.android.billingclient.api.BillingFlowParams
import com.android.billingclient.api.BillingResult
import com.android.billingclient.api.ProductDetails
import com.android.billingclient.api.Purchase
import com.android.billingclient.api.PurchasesUpdatedListener
import com.android.billingclient.api.QueryProductDetailsParams
import com.android.billingclient.api.QueryPurchasesParams
import kr.sn0wman.quonandroid.R

class BillingManager(
    context: Context,
    private val onAdFreeChanged: (Boolean) -> Unit,
    private val onError: (Int) -> Unit
) : PurchasesUpdatedListener {

    private val billingClient: BillingClient = BillingClient.newBuilder(context)
        .setListener(this)
        .enablePendingPurchases()
        .build()

    private var productDetails: ProductDetails? = null
    var isReady: Boolean = false
        private set

    fun start() {
        if (billingClient.isReady) {
            isReady = true
            queryProduct()
            queryExistingPurchases()
            return
        }

        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(result: BillingResult) {
                isReady = result.responseCode == BillingClient.BillingResponseCode.OK
                if (isReady) {
                    queryProduct()
                    queryExistingPurchases()
                }
            }

            override fun onBillingServiceDisconnected() {
                isReady = false
            }
        })
    }

    fun end() {
        if (billingClient.isReady) billingClient.endConnection()
        isReady = false
    }

    fun launchRemoveAdsPurchase(activity: Activity) {
        val details = productDetails
        if (!isReady || details == null) {
            onError(R.string.billing_not_ready)
            return
        }

        val productParams = BillingFlowParams.ProductDetailsParams.newBuilder()
            .setProductDetails(details)
            .build()

        billingClient.launchBillingFlow(
            activity,
            BillingFlowParams.newBuilder()
                .setProductDetailsParamsList(listOf(productParams))
                .build()
        )
    }

    override fun onPurchasesUpdated(result: BillingResult, purchases: MutableList<Purchase>?) {
        when (result.responseCode) {
            BillingClient.BillingResponseCode.OK -> {
                handlePurchases(purchases.orEmpty())
            }

            BillingClient.BillingResponseCode.USER_CANCELED -> {
                // User canceled purchase flow; keep current entitlement state.
            }

            else -> {
                onError(R.string.billing_purchase_failed)
            }
        }
    }

    private fun queryProduct() {
        val product = QueryProductDetailsParams.Product.newBuilder()
            .setProductId(MonetizationConfig.REMOVE_ADS_PRODUCT_ID)
            .setProductType(BillingClient.ProductType.INAPP)
            .build()

        val params = QueryProductDetailsParams.newBuilder()
            .setProductList(listOf(product))
            .build()

        billingClient.queryProductDetailsAsync(params) { result, products ->
            if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                productDetails = products.firstOrNull()
            } else {
                productDetails = null
                onError(R.string.billing_not_ready)
            }
        }
    }

    private fun queryExistingPurchases() {
        val params = QueryPurchasesParams.newBuilder()
            .setProductType(BillingClient.ProductType.INAPP)
            .build()

        billingClient.queryPurchasesAsync(params) { result, purchases ->
            if (result.responseCode == BillingClient.BillingResponseCode.OK) {
                handlePurchases(purchases)
            } else {
                onAdFreeChanged(false)
            }
        }
    }

    private fun handlePurchases(purchases: List<Purchase>) {
        var ownsAdFree = false
        purchases.forEach { purchase ->
            val ownsRemoveAds = purchase.products.contains(MonetizationConfig.REMOVE_ADS_PRODUCT_ID)
            if (ownsRemoveAds && purchase.purchaseState == Purchase.PurchaseState.PURCHASED) {
                ownsAdFree = true
                if (!purchase.isAcknowledged) {
                    val ack = AcknowledgePurchaseParams.newBuilder()
                        .setPurchaseToken(purchase.purchaseToken)
                        .build()
                    billingClient.acknowledgePurchase(ack) { }
                }
            }
        }
        onAdFreeChanged(ownsAdFree)
    }
}
