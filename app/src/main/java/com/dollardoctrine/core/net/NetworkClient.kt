package com.dollardoctrine.core.net

import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.json.JSONObject
import java.net.URI

class NetworkClient(
    var serverUrl: String = "http://10.0.2.2:4000" // 10.0.2.2 para emulador Android, ou IP local
) {
    private var socket: Socket? = null

    private val _connected = MutableStateFlow(false)
    val connected: StateFlow<Boolean> = _connected.asStateFlow()

    private val _latestEvent = MutableStateFlow<Pair<String, String>?>(null)
    val latestEvent: StateFlow<Pair<String, String>?> = _latestEvent.asStateFlow()

    fun connect(jwtToken: String? = null) {
        if (socket?.connected() == true) return

        try {
            val options = IO.Options().apply {
                reconnection = true
                reconnectionAttempts = 10
                reconnectionDelay = 2000
                timeout = 10000
                if (!jwtToken.isNullOrEmpty()) {
                    auth = mapOf("token" to jwtToken)
                }
            }

            val uri = URI.create(serverUrl)
            socket = IO.socket(uri, options).apply {
                on(Socket.EVENT_CONNECT) {
                    _connected.value = true
                }
                on(Socket.EVENT_DISCONNECT) {
                    _connected.value = false
                }
                on(Socket.EVENT_CONNECT_ERROR) {
                    _connected.value = false
                }
                on("server:stats") { args ->
                    if (args.isNotEmpty()) {
                        _latestEvent.value = "server:stats" to args[0].toString()
                    }
                }
                on("match:start") { args ->
                    if (args.isNotEmpty()) {
                        _latestEvent.value = "match:start" to args[0].toString()
                    }
                }
                on("match:resolved") { args ->
                    if (args.isNotEmpty()) {
                        _latestEvent.value = "match:resolved" to args[0].toString()
                    }
                }
                on("bloc:chat") { args ->
                    if (args.isNotEmpty()) {
                        _latestEvent.value = "bloc:chat" to args[0].toString()
                    }
                }
                connect()
            }
        } catch (e: Exception) {
            _connected.value = false
        }
    }

    fun disconnect() {
        socket?.disconnect()
        socket?.close()
        socket = null
        _connected.value = false
    }

    fun emitEvent(name: String, data: JSONObject) {
        socket?.emit(name, data)
    }

    fun emitEvent(name: String, message: String) {
        socket?.emit(name, message)
    }
}
