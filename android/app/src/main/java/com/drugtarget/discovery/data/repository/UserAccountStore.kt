package com.drugtarget.discovery.data.repository

import android.content.Context
import android.content.SharedPreferences

object UserAccountStore {
    private const val PREF_NAME = "drug_target_users_pref"
    private lateinit var prefs: SharedPreferences

    fun init(context: Context) {
        prefs = context.applicationContext.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE)
        // Seed default test account if none exists
        if (!prefs.contains("exists_vamsi@theratarget.org")) {
            saveUser("vamsi@theratarget.org", "password123", "Dr. Vamsi Ghattamaneni", "Lead Computational Oncologist", "Therapeutic Discovery Institute")
        }
    }

    fun saveUser(email: String, pass: String, name: String, role: String, institution: String) {
        val cleanEmail = email.trim().lowercase()
        prefs.edit()
            .putString("pass_$cleanEmail", pass)
            .putString("name_$cleanEmail", name)
            .putString("role_$cleanEmail", role)
            .putString("inst_$cleanEmail", institution)
            .putBoolean("exists_$cleanEmail", true)
            .apply()
    }

    fun userExists(email: String): Boolean {
        val cleanEmail = email.trim().lowercase()
        return prefs.getBoolean("exists_$cleanEmail", false)
    }

    fun checkPassword(email: String, pass: String): Boolean {
        val cleanEmail = email.trim().lowercase()
        val savedPass = prefs.getString("pass_$cleanEmail", null)
        return savedPass == pass
    }

    fun getUser(email: String): Map<String, String>? {
        val cleanEmail = email.trim().lowercase()
        if (!userExists(cleanEmail)) return null
        return mapOf(
            "email" to cleanEmail,
            "name" to (prefs.getString("name_$cleanEmail", cleanEmail.substringBefore("@")) ?: ""),
            "role" to (prefs.getString("role_$cleanEmail", "Computational Biologist") ?: ""),
            "institution" to (prefs.getString("inst_$cleanEmail", "Therapeutic Discovery Institute") ?: "")
        )
    }
}
