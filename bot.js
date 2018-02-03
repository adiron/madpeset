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
    return ctx.reply('Welcome!');
})

function printDate(callback) {
    printText((new Date()).toLocaleString("iw"));
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
        const nameCmd = 'From ' + ctx.message.from.first_name  + ' ' + ctx.message.from.last_name + ' - @' + ctx.message.from.username + '\n\n' + content
        console.log("Printing message:",ctx.message)
        ctx.reply("Alright, I'll print your message!")
        printText(nameCmd)
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
            const nameCmd = 'From ' + ctx.message.from.first_name  + ' ' + ctx.message.from.last_name + ' - @' + ctx.message.from.username
            printDate(() => printText(nameCmd, () => printBanner(content)))
        }
    } else {
        ctx.reply("Send the command /banner <your text>")
    }
    console.log("Printing banner:",ctx.message)
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
                        console.log("Downloaded with wget:");
                        const fname = result.split('/').reverse()[0]
                        const nameCmd = 'From ' + ctx.message.from.first_name  + ' ' + ctx.message.from.last_name + ' - @' + ctx.message.from.username
                        printDate(() => {printText(nameCmd, function() {
                            let child_lp = exec('lp -d thermal -- tmp/' + fname)
                        })});
                    })
        }, function(err) {
            console.log("error!!")
            console.log(err)
        }
    )

});

bot.startPolling()
