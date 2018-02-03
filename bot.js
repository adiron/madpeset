const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
const settings = require('./settings.json')

const bot = new Telegraf(settings.TOKEN)
const telegram = new Telegram(settings.TOKEN)

const child_process = require('child_process')
const exec = child_process.exec

console.log("Starting bot...")

bot.start((ctx) => {
    console.log('started:', ctx.from.id);
    return ctx.reply('Welcome! I am a printer bot. I print stuff. Try sending an image.');
})

function getDate() {
    return (new Date()).toLocaleString("iw")
}

function getNameString(msg) {
    if (msg.from.first_name || msg.from.last_name) {
        // return 'From ' + ( msg.from.first_name || '' )  + ' ' + ( msg.from.last_name || '' ) + ' - @' + msg.from.username
        return ['From', msg.from.first_name, msg.from.last_name, "- @" + msg.from.username]
            .filter(e => e)
            .join(' ')
    } else {
        return 'From @'  + msg.from.username
    }
}

function printDate(callback) {
    printText(getDate());
    if (callback) {
        callback()
    }
}

function printText(t, callback) {
    const child = child_process.spawn('lp', ['-d', 'thermal', '-o', 'cpi=19'])
    child.stdin.write(t)
    child.stdin.end()
    if (callback) {
        callback()
    }
}

function printBanner(t, callback) {
    const child = child_process.spawn('./mkbanner.sh', [])
    child.stdin.write(t)
    child.stdin.end()
    if (callback) {
        callback()
    }
}

bot.command('help', (ctx) => ctx.reply('Send an image or use the command /print to print a message!'))
bot.command('print', (ctx) => {
    const content = ctx.message.text.replace(/^\/print ?/, '')
    if (content.length > 0) {
        const nameCmd = getNameString(ctx.message) + '\n\n' + content
        console.log("Printing message:",ctx.message)
        ctx.reply("Alright, I'll print your message!")
        printText(getDate() + "\n" + nameCmd)
    } else {
        ctx.reply("Send the command /print <your text>")
    }
})
bot.command('banner', (ctx) => {
    const content = ctx.message.text.replace(/^\/banner ?/, '')
    if (content.length > 0) {
        if (content.length > 128) {
            ctx.reply("Now you're just being silly. Try a shorter input...")
        } else {
            ctx.reply("Alright! Banner coming up.")
            const nameCmd = getNameString(ctx.message)
            printText(getDate() + "\n" + nameCmd, () => printBanner(content))
        }
    } else {
        ctx.reply("Send the command /banner <your text>")
    }
    console.log("Printing banner:", content, "from", ctx.message.from)
})
bot.on('photo', (ctx) => {
    const img_obj = ctx.message.photo.sort((a, b) => b.file_size - a.file_size)[0]
    console.log("Selected image obj:", img_obj);
    ctx.reply("Okay, printing photo!");
    telegram.getFileLink(img_obj.file_id).then(
        function(result) {
            console.log("Trying to download", result)
            let child_wget = exec('wget ' + result + ' -P tmp/', 
                    function(error, stdout, stderr) {
                        console.log("Downloaded with wget!");
                        const fname = result.split('/').reverse()[0]
                        const nameCmd = getNameString(ctx.message)
                        printText(getDate() + "\n" + nameCmd, function() {
                            let child_lp = exec('lp -d thermal -- tmp/' + fname)
                        });
                    })
        }, function(err) {
            console.log("error!!")
            console.log(err)
        }
    )

});

bot.startPolling()
