# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Capacitor Essential Rules (Prevents crashes when minification is on)
-keep class com.getcapacitor.** { *; }
-keep @interface com.getcapacitor.NativePlugin
-keep @interface com.getcapacitor.CapacitorPlugin
-keep @interface com.getcapacitor.PluginMethod
-keep class * extends com.getcapacitor.Plugin { *; }
-keep class * extends com.getcapacitor.Bridge { *; }
-keep class * extends com.getcapacitor.BridgeActivity { *; }

# Preserve line numbers for debugging
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
