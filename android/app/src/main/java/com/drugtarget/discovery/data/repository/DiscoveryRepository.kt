package com.drugtarget.discovery.data.repository

import com.drugtarget.discovery.data.api.ApiClient
import com.drugtarget.discovery.data.api.DrugTargetApiService
import com.drugtarget.discovery.data.model.DTIPredictionRequest
import com.drugtarget.discovery.data.model.DTIPredictionResponse
import com.drugtarget.discovery.data.model.HealthResponse
import com.drugtarget.discovery.data.model.TargetInfo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.flowOn

class DiscoveryRepository(
    private val apiService: DrugTargetApiService = ApiClient.apiService
) {

    fun checkHealth(): Flow<Result<HealthResponse>> = flow {
        try {
            val response = apiService.getHealth()
            emit(Result.success(response))
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }.flowOn(Dispatchers.IO)

    fun getTargets(): Flow<Result<List<TargetInfo>>> = flow {
        try {
            val targets = apiService.getTargets()
            emit(Result.success(targets))
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }.flowOn(Dispatchers.IO)

    fun predictInteraction(request: DTIPredictionRequest): Flow<Result<DTIPredictionResponse>> = flow {
        try {
            val result = apiService.predictInteraction(request)
            emit(Result.success(result))
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }.flowOn(Dispatchers.IO)
}
