package com.anonymous.focusshell.services

import android.graphics.drawable.Icon
import android.os.Build
import android.service.quicksettings.Tile
import android.service.quicksettings.TileService
import androidx.annotation.RequiresApi
import com.anonymous.focusshell.R

/**
 * Quick Settings Tile for instant Focus Mode toggle
 * Appears in Android Quick Settings panel
 */
@RequiresApi(Build.VERSION_CODES.N)
class FocusTileService : TileService() {

    companion object {
        private var isFocusActive = false

        fun setFocusState(active: Boolean) {
            isFocusActive = active
        }
    }

    override fun onStartListening() {
        super.onStartListening()
        updateTile()
    }

    override fun onClick() {
        super.onClick()
        
        // Toggle focus mode
        isFocusActive = !isFocusActive
        
        // Update tile UI
        updateTile()

        // TODO: Trigger focus mode in React Native
        // This could send a broadcast intent that React Native listens to
        // or use a shared preference that React Native polls
    }

    private fun updateTile() {
        qsTile?.apply {
            state = if (isFocusActive) Tile.STATE_ACTIVE else Tile.STATE_INACTIVE
            label = if (isFocusActive) "Focus ON" else "Focus OFF"
            contentDescription = if (isFocusActive) {
                "Focus mode is active. Tap to disable."
            } else {
                "Focus mode is off. Tap to enable."
            }
            updateTile()
        }
    }
}
