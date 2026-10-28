package com.drugtarget.discovery.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.drugtarget.discovery.data.model.DTIPredictionRequest
import com.drugtarget.discovery.data.model.DTIPredictionResponse
import com.drugtarget.discovery.data.model.HealthResponse
import com.drugtarget.discovery.data.model.TargetInfo
import com.drugtarget.discovery.data.repository.DiscoveryRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

data class DiscoveryUiState(
    val isBackendOnline: Boolean? = null,
    val backendInfo: HealthResponse? = null,
    val targets: List<TargetInfo> = emptyList(),
    val isLoadingTargets: Boolean = false,
    val selectedTargetId: String = "CHEMBL203",
    val selectedCompoundName: String = "Gefitinib (Iressa)",
    val compoundSmiles: String = "COC1=C(OCC2=CC=CC=C2)C=C2C(=C1)N=CN=C2NC1=CC(Cl)=C(F)C=C1",
    val isPredicting: Boolean = false,
    val predictionResult: DTIPredictionResponse? = null,
    val errorMessage: String? = null
)

class DiscoveryViewModel(
    private val repository: DiscoveryRepository = DiscoveryRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(DiscoveryUiState())
    val uiState: StateFlow<DiscoveryUiState> = _uiState.asStateFlow()

    init {
        checkBackendHealth()
        loadTargets()
    }

    fun checkBackendHealth() {
        viewModelScope.launch {
            repository.checkHealth().collect { result ->
                result.onSuccess { health ->
                    _uiState.update { it.copy(isBackendOnline = true, backendInfo = health) }
                }.onFailure {
                    _uiState.update { it.copy(isBackendOnline = false) }
                }
            }
        }
    }

    fun loadTargets() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoadingTargets = true) }
            repository.getTargets().collect { result ->
                result.onSuccess { targetList ->
                    _uiState.update {
                        it.copy(
                            targets = targetList,
                            isLoadingTargets = false,
                            selectedTargetId = targetList.firstOrNull()?.targetId ?: "CHEMBL203"
                        )
                    }
                }.onFailure {
                    _uiState.update { it.copy(isLoadingTargets = false) }
                }
            }
        }
    }

    fun selectTarget(targetId: String) {
        _uiState.update { it.copy(selectedTargetId = targetId) }
    }

    fun selectCompound(name: String, smiles: String) {
        _uiState.update {
            it.copy(
                selectedCompoundName = name,
                compoundSmiles = smiles
            )
        }
    }

    fun updateCompoundSmiles(smiles: String) {
        _uiState.update { it.copy(compoundSmiles = smiles) }
    }

    fun runPrediction() {
        val currentState = _uiState.value
        val request = DTIPredictionRequest(
            targetId = currentState.selectedTargetId,
            compoundSmiles = currentState.compoundSmiles
        )

        viewModelScope.launch {
            _uiState.update { it.copy(isPredicting = true, errorMessage = null) }
            repository.predictInteraction(request).collect { result ->
                result.onSuccess { response ->
                    _uiState.update {
                        it.copy(
                            isPredicting = false,
                            predictionResult = response,
                            errorMessage = null
                        )
                    }
                }.onFailure { err ->
                    _uiState.update {
                        it.copy(
                            isPredicting = false,
                            errorMessage = err.localizedMessage ?: "Prediction failed"
                        )
                    }
                }
            }
        }
    }
}
