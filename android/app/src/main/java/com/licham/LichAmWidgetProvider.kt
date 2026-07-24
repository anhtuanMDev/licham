package com.licham

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.widget.RemoteViews

class LichAmWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        // There may be multiple widgets active, so update all of them
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    private fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
        // Read data from SharedPreferences
        val prefs = context.getSharedPreferences("LichAmWidgetPrefs", Context.MODE_PRIVATE)
        val solarDate = prefs.getString("solarDate", "1/1/2026")
        val lunarDate = prefs.getString("lunarDate", "Ngày 1 Tháng 1")
        val canChi = prefs.getString("canChi", "Can Chi")

        // Construct the RemoteViews object
        val views = RemoteViews(context.packageName, R.layout.widget_layout)
        views.setTextViewText(R.id.widget_solar_date, solarDate)
        views.setTextViewText(R.id.widget_lunar_date, lunarDate)
        views.setTextViewText(R.id.widget_canchi, canChi)

        // Instruct the widget manager to update the widget
        appWidgetManager.updateAppWidget(appWidgetId, views)
    }
}
