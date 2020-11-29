import search from 'youtube-search';
import gapikey from '../../private/keys/gapikey.js';

var opts = {
	maxResults: 10,
	key: gapikey
};

var args = process.argv;
args.shift();
args.shift();

if(args[0].substring(0, 4) === 'http' || !args.join('').replace(/\s/g, '').length) {
	console.log(args.join(' '));
} else {
	search(args.join(' '), opts, (err, results) => {
  		err ? console.log(err) : console.log(results[0].link);
	});
}
