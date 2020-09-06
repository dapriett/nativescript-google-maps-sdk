const { exec } = require('child_process');
const semver = require('semver');

exec('tns --version', (err, stdout, stderr) => {
    if (err) {
        // node couldn't execute the command
        console.log(`tns --version err: ${err}`);
        return;
    }

    const tnsVersion = semver.major(stdout);

    const nsCmd = tnsVersion >= 7 ? 'ns' : 'tns';

    // execute 'tns plugin build' for {N} version > 4. This command builds .aar in platforms/android folder.
    if (tnsVersion >= 4 && tnsVersion < 7) {

        console.log(`executing '${nsCmd} plugin build'`);

        exec(`${nsCmd} plugin build`, () => {
            console.warn(`Your version of nativescript is outdated, update it with: npm i -g nativescript`)
        });
    }
    else if (tnsVersion >= 7) {
        console.log(`executing '${nsCmd} plugin build'`);
        exec(`${nsCmd} plugin build`);
    }
    else {
        // ns version not supported
        console.error(`Nativescript version must be at least 4! Please run npm i -g nativescript & retry.\nexit`);
    }

});
