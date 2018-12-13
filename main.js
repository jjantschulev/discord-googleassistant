const Discord = require("discord.io");
const auth = require("./secrets/auth.json");
const path = require("path");
const GoogleAssistant = require("google-assistant");
const config = {
    auth: {
        keyFilePath: path.resolve(
            __dirname,
            "secrets",
            "client_secret_744288172414-l7ra837128tm0p0lhjn74f0vec8h3rvn.apps.googleusercontent.com.json"
        ),
        // where you want the tokens to be saved
        // will create the directory if not already there
        savedTokensPath: path.resolve(__dirname, "secrets", "tokens.json")
    },

    conversation: {
        textQuery: "What time is it?",
        isNew: true
    }
};

let assistantReady = false;
const assistant = new GoogleAssistant(config.auth);
assistant.on("ready", () => (assistantReady = true));

// Init Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

bot.on("ready", function(evt) {
    console.log("Connected");
    console.log("Logged in as: ");
    console.log(bot.username + " - (" + bot.id + ")");
});

bot.on("message", function(user, userID, channelID, message, evt) {
    if (message.substring(0, 3) == "!ga") {
        var query = message.substring(4);
        if (isEmpty(query)) {
            bot.sendMessage({
                to: channelID,
                message: "You have to actually ask me something."
            });
        }
        if (!assistantReady) {
            bot.sendMessage({
                to: channelID,
                message:
                    "Google assistant not ready yet. Please try again in a few secs..."
            });
        }
        config.conversation.textQuery = query;
        assistant.start(config.conversation, conversation => {
            conversation
                .on("response", text => {
                    bot.sendMessage({
                        to: channelID,
                        message: text
                    });
                })
                .on("ended", (error, continueConversation) => {
                    // once the conversation is ended, see if we need to follow up
                    if (error)
                        bot.sendMessage({
                            to: channelID,
                            message: "There was an error: \n" + error
                        });
                })
                .on("error", error =>
                    bot.sendMessage({
                        to: channelID,
                        message: "There was an error: \n" + error.details
                    })
                );
        });
    }
});

function isEmpty(str) {
    return str.length === 0 || !str.trim();
}
