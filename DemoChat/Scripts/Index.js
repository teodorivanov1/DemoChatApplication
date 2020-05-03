$(() => {
    // Initialize tabs used as a chat rooms
    $("#tabs-left").tabs();

    // Show login screen
    setChatViewMode(false);

    // Initialize SignalR chat hub
    var chatHub = $.connection.chatHub;
    handleHub(chatHub);

    // Start Hub and attach events
    $.connection.hub.start().done(() => registerEvents(chatHub));
});

function setChatViewMode(isLogin) {

    if (!isLogin) {

        $("#chatContainer").hide();
        $("#loginContainer").show();
    }
    else {

        $("#chatContainer").show();
        $("#loginContainer").hide();
    }
}

// Global function for UI controls and events
function registerEvents(chatHub) {

    // Login screen: assign nickname
    $("#btnJoin").click(function () {

        var name = $("#txtNickName").val();
        if (name.length > 0) {
            chatHub.server.connect(name);
        }
        else {
            alert("Nickname cannot be empty.");
        }
    });

    // Send message
    $('#btnSend').click(() => {
        var msg = $("#txtMsg").val();
        var activeTabIndex = $("#tabs-left").tabs('option', 'active'); 
        if (msg.length > 0) {
            var nickname = $('#hNickname').val();
            chatHub.server.sendMessageToAll(nickname, msg, activeTabIndex);
            $("#txtMsg").val('');
        }
    });

    // Enter the nickname when enter is pressed
    $("#txtNickName").keypress((e) => {
        if (e.which === 13) {
            $("#btnJoin").click();
        }
    });

    // Send a message when enter is pressed
    $("#txtMsg").keypress((e) => {
        if (e.which === 13) {
            $('#btnSend').click();
        }
    });
}

// Global methods for chatHub
function handleHub(chatHub) {

    // OnConnect: add users to left side
    chatHub.client.onConnected = (user, users, messages) => {
        // Set visible chat area and hide login screen
        setChatViewMode(true);

        $('#hConnectionId').val(user.ConnectionId);
        $('#hNickname').val(user.Nickname);
        for (i = 0; i < users.length; i++) {
            AddUser(chatHub, users[i], false);
        }
    };

    // Remove user from the chat
    chatHub.client.onUserDisconnected = (user) => {

        $('#user_' + user.ConnectionId).remove();
        AddMessage(user.Nickname, ' has desconnected', 0, true);
    };

    // Add user when another user is connected
    chatHub.client.onNewUserConnected = (user) => AddUser(chatHub, user);

    // Append message
    chatHub.client.messageReceived = (nickname, msg, activeTabIndex) => AddMessage(nickname, msg, activeTabIndex , false);
}

function AddUser(chatHub, user, showNotice = true) {

    $('#tabItems').append($('<li id = "user_' + user.ConnectionId + '">' + user.Nickname + "</li>"));
    if (showNotice)
        AddMessage(user.Nickname, ' has joined', 0, true);
}

function AddMessage(nickname, msg, activeTabIndex, isServive) {
    var currentTab = $('#tabs-' + (activeTabIndex + 1)); // always cast to int
    if (isServive) {
        currentTab.append('<div style="color: red;"> ***' +
            '[' +
            new Date().toLocaleString() + '] ' +
            '<b>' + nickname + '</b>'+
            msg + '</div>');
    } else {
        currentTab.append('<div>' +
            '[' +
            new Date().toLocaleString() + '] ' + '<b>' +
            nickname + '</b>' +
            ': ' + msg + '</div>');
    }
    // Scroll to the last line
    currentTab.scrollTop(currentTab.scrollHeight);
}
