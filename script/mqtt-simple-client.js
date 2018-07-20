var mqttClient;

function resetState() {
    document.getElementById("topic_list").innerHTML = "";
    document.getElementById("terminal").innerHTML = "";
}

function mqttConnect() {
    var config = {
        host: document.forms["connect"]["host"].value,
        port: document.forms["connect"]["port"].value,
        clientId: document.forms["connect"]["clientId"].value,
        clientUsername: document.forms["connect"]["clientUsername"].value,
        clientPassword: document.forms["connect"]["clientPassword"].value,
        useSSL: document.forms["connect"]["useSSL"].checked
    };
    mqttClient = new Paho.MQTT.Client(config.host, Number(config.port), config.clientId);
    mqttClient.onConnectionLost = mqttConnectionLostHandle;
    mqttClient.onMessageArrived = mqttMessageHandle;

    console.log("Connecting to " + config.host + ":" + config.port + "...");
    mqttClient.connect({userName: config.clientUsername, password: config.clientPassword,
            useSSL: config.useSSL, onSuccess: mqttConnectionSuccessful, 
            onFailure: mqttConnectionFailed});
}

function mqttDisconnect() {
    mqttClient.disconnect();
    alert("Client disconnected");
    console.log("Disconnected");
}

function topicSubscribe() {
    var topic = document.forms["subscribe"]["topic"].value;
    if (topic == "") {
        alert("Topic must not be empty");
        return;
    }
    for (var i = 0; i < document.getElementById("topic_list").length; i++) {
        if (document.getElementById("topic_list").options[i].value == topic) {
            alert("Topic already subsrcibed");
            return;
        }
    }
    document.getElementById("topic_list").innerHTML += "<option value=\"" + topic + "\">" + topic 
            + "</option>";
    mqttClient.subscribe(topic);
    console.log("SUBSCRIBE: " + topic);

    document.forms["subscribe"]["topic"].value = "";
}

function topicUnsubscribe() {
    var topic;
    var topicList = document.getElementById("topic_list");
    var index = topicList.selectedIndex;
    if (index != -1) {
        topic = topicList.options[index].value;
        mqttClient.unsubscribe(topic);
        console.log("UNSUBSCRIBE: " + topic);
        topicList.remove(index);
    } else {
        alert("No topic selected");
    }
}

function publishMessage() {
    var topic = document.forms["publish"]["topic"].value;
    if (topic == "") {
        alert("Topic must not be empty");
        return;
    }
    var payload = document.forms["publish"]["msg"].value;
    var message = new Paho.MQTT.Message(payload);
    message.destinationName = topic;
    mqttClient.send(message);
    console.log(">> [" + topic + "]:" + payload);
    document.getElementById("terminal").innerHTML += "<p>>> [" + topic + "]:" + payload + "</p>";

    document.forms["publish"]["topic"].value = "";
    document.forms["publish"]["msg"].value = "";
}

function mqttConnectionSuccessful() {
    alert("Connected to broker!");
    console.log("Connection successful");
    document.getElementById("button_connect").disabled = true;
    document.getElementById("button_disconnect").disabled = false;
    document.getElementById("sector_subscribe").style.visibility = "visible";
    document.getElementById("sector_msg").style.visibility = "visible";
}

function mqttConnectionFailed(responseObject) {
    alert("Cannot connect to broker!");
    console.log("Connection failed [" + responseObject.errorCode + "]: "
            + responseObject.errorMessage);
}

function mqttConnectionLostHandle(responseObject) {
    if (responseObject.errorCode) {
        alert("Connection lost!");
        console.log("Connection lost [" + responseObject.errorCode + "]: "
                + responseObject.errorMessage);
    }
    document.getElementById("button_connect").disabled = false;
    document.getElementById("button_disconnect").disabled = true;
    document.getElementById("sector_subscribe").style.visibility = "hidden";
    document.getElementById("sector_msg").style.visibility = "hidden";
    resetState();
}

function mqttMessageHandle(message) {
    console.log("<< [" + message.destinationName + "]:" + message.payloadString);
    document.getElementById("terminal").innerHTML += "<p><< [" + message.destinationName + "]:" +
            message.payloadString + "</p>";
}
