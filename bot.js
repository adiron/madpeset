const Telegraf = require('telegraf')
const Telegram = require('telegraf/telegram')
const settings = require('./settings.json')

const bot = new Telegraf(settings.TOKEN)
const telegram = new Telegram(settings.TOKEN)

const exec = require('child_process').exec

console.log("Starting bot...")

bot.start((ctx) => {
	console.log('started:', ctx.from.id);
	return ctx.reply('Welcome!');
})

bot.command('help', (ctx) => ctx.reply('Send an image or use the command /print.'))
bot.on('photo', (ctx) => {
	ctx.reply(ctx.message);
	const img_obj = ctx.message.photo.sort((a, b) => b.file_size - a.file_size)[0]
	console.log("Selected image obj:", img_obj);
	ctx.reply("Okay, printing photo!");
	telegram.getFileLink(img_obj.file_id).then(
		function(result) {
			console.log("Trying to download", result)
			let child_wget = exec('wget ' + result, 
					function(error, stdout, stderr) {
						console.log("Downloaded with wget:");
						const fname = result.split('/').reverse()[0]
						const nameCmd = 'echo From ' + ctx.message.from.first_name  + ' ' + ctx.message.from.last_name + ' - @' + ctx.message.from.username + '| lp -d thermal'
						let child_personName = exec(nameCmd, function() {
							let child_lp = exec('lp -d thermal -- ' + fname)
						})
					})
		}, function(err) {
			console.log("erro!!")
			console.log(err)
		}
	)

});

bot.startPolling()
