package com.anonymous.focusshell;

import android.animation.ValueAnimator;
import android.content.Context;
import android.graphics.PixelFormat;
import android.os.Build;
import android.util.Log;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.Button;
import android.widget.TextView;

/**
 * FrictionOverlayWindow - Floating overlay for friction moments
 * 
 * Shows a breathing animation with countdown and action buttons
 * Appears as a system overlay on top of blocked apps
 */
public class FrictionOverlayWindow {
    private static final String TAG = "FrictionOverlayWindow";
    
    private Context context;
    private WindowManager windowManager;
    private View overlayView;
    private boolean isShowing = false;
    
    private TextView countdownText;
    private TextView instructionText;
    private View breathingCircle;
    private Button takeOutButton;
    private Button grant5Button;
    private Button grant10Button;
    private Button continueButton;
    
    private int delaySeconds;
    private int remainingSeconds;
    private ValueAnimator breathAnimator;
    
    public FrictionOverlayWindow(Context context) {
        this.context = context;
        this.windowManager = (WindowManager) context.getSystemService(Context.WINDOW_SERVICE);
    }
    
    public void show(String appName, int delaySeconds) {
        if (isShowing) {
            Log.w(TAG, "Overlay already showing");
            return;
        }
        
        this.delaySeconds = delaySeconds;
        this.remainingSeconds = delaySeconds;
        
        try {
            createOverlayView(appName);
            addToWindowManager();
            startBreathingAnimation();
            startCountdown();
            isShowing = true;
            Log.d(TAG, "Overlay shown");
        } catch (Exception e) {
            Log.e(TAG, "Error showing overlay", e);
        }
    }
    
    public void dismiss() {
        if (!isShowing) return;
        
        try {
            if (breathAnimator != null) {
                breathAnimator.cancel();
            }
            if (overlayView != null && windowManager != null) {
                windowManager.removeView(overlayView);
            }
            isShowing = false;
            Log.d(TAG, "Overlay dismissed");
        } catch (Exception e) {
            Log.e(TAG, "Error dismissing overlay", e);
        }
    }
    
    private void createOverlayView(String appName) {
        LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        overlayView = inflater.inflate(R.layout.friction_overlay, null);
        
        // Find views
        countdownText = overlayView.findViewById(R.id.countdown_text);
        instructionText = overlayView.findViewById(R.id.instruction_text);
        breathingCircle = overlayView.findViewById(R.id.breathing_circle);
        takeOutButton = overlayView.findViewById(R.id.take_out_button);
        grant5Button = overlayView.findViewById(R.id.grant_5_button);
        grant10Button = overlayView.findViewById(R.id.grant_10_button);
        continueButton = overlayView.findViewById(R.id.continue_button);
        
        // Set app name
        TextView appNameText = overlayView.findViewById(R.id.app_name_text);
        appNameText.setText("Opening " + appName);
        
        // Set up button listeners
        takeOutButton.setOnClickListener(v -> {
            dismiss();
            // Go back to home
            OverlayService.bringLauncherToForeground(context);
        });
        
        grant5Button.setOnClickListener(v -> {
            // TODO: Grant 5 minutes access
            dismiss();
        });
        
        grant10Button.setOnClickListener(v -> {
            // TODO: Grant 10 minutes access
            dismiss();
        });
        
        continueButton.setOnClickListener(v -> {
            dismiss();
        });
        
        // Hide time grant buttons initially
        grant5Button.setVisibility(View.GONE);
        grant10Button.setVisibility(View.GONE);
        continueButton.setVisibility(View.GONE);
        
        countdownText.setText(String.valueOf(remainingSeconds));
    }
    
    private void addToWindowManager() {
        WindowManager.LayoutParams params = new WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            Build.VERSION.SDK_INT >= Build.VERSION_CODES.O ?
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY :
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE |
                WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        );
        
        params.gravity = Gravity.CENTER;
        windowManager.addView(overlayView, params);
    }
    
    private void startBreathingAnimation() {
        breathAnimator = ValueAnimator.ofFloat(1.0f, 1.2f);
        breathAnimator.setDuration(3000);
        breathAnimator.setRepeatCount(ValueAnimator.INFINITE);
        breathAnimator.setRepeatMode(ValueAnimator.REVERSE);
        breathAnimator.setInterpolator(new AccelerateDecelerateInterpolator());
        
        breathAnimator.addUpdateListener(animation -> {
            float scale = (float) animation.getAnimatedValue();
            breathingCircle.setScaleX(scale);
            breathingCircle.setScaleY(scale);
            
            // Animate opacity
            float alpha = 0.3f + (scale - 1.0f) * 1.5f;
            breathingCircle.setAlpha(Math.min(0.6f, Math.max(0.3f, alpha)));
        });
        
        breathAnimator.start();
    }
    
    private void startCountdown() {
        final android.os.Handler handler = new android.os.Handler();
        handler.postDelayed(new Runnable() {
            @Override
            public void run() {
                remainingSeconds--;
                
                if (remainingSeconds > 0) {
                    countdownText.setText(String.valueOf(remainingSeconds));
                    instructionText.setText("Take a breath...");
                    handler.postDelayed(this, 1000);
                } else {
                    // Countdown finished
                    countdownText.setText("✓");
                    instructionText.setText("Ready");
                    
                    // Show action buttons
                    grant5Button.setVisibility(View.VISIBLE);
                    grant10Button.setVisibility(View.VISIBLE);
                    continueButton.setVisibility(View.VISIBLE);
                }
            }
        }, 1000);
    }
    
    public boolean isShowing() {
        return isShowing;
    }
}
