package com.drugtarget.discovery.data.api

import com.drugtarget.discovery.data.model.DTIPredictionRequest
import com.drugtarget.discovery.data.model.DTIPredictionResponse
import com.drugtarget.discovery.data.model.HealthResponse
import com.drugtarget.discovery.data.model.TargetInfo
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface DrugTargetApiService {

    @GET("health")
    suspend fun getHealth(): HealthResponse

    @GET("api/v1/interactions/targets")
    suspend fun getTargets(): List<TargetInfo>

    @POST("api/v1/interactions/predict")
    suspend fun predictInteraction(
        @Body request: DTIPredictionRequest
    ): DTIPredictionResponse
}
