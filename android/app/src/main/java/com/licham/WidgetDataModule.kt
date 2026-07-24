package com.licham

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class WidgetDataModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "WidgetDataModule"
    }

    @ReactMethod
    fun setWidgetData(solarDate: String, lunarDate: String, canChi: String) {
        val sharedPref = reactApplicationContext.getSharedPreferences("LichAmWidgetPrefs", Context.MODE_PRIVATE)
        with(sharedPref.edit()) {
            putString("solarDate", solarDate)
            putString("lunarDate", lunarDate)
            putString("canChi", canChi)
            apply()
        }

        // Trigger widget update
        val intent = Intent(reactApplicationContext, LichAmWidgetProvider::class.java)
        intent.action = AppWidgetManager.ACTION_APPWIDGET_UPDATE
        
        val ids = AppWidgetManager.getInstance(reactApplicationContext)
            .getAppWidgetIds(ComponentName(reactApplicationContext, LichAmWidgetProvider::class.java))
        
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids)
        reactApplicationContext.sendBroadcast(intent)
    }
}
