### Running Locally: Mac

##### Starting the client & server:
```bash
$ npm i
$ npm run ng serve
$ npm run start:default
```

##### Python Setup:
There is a bug somewhere in Node/Python that requires `python3.11.x`, not `python3.12.x`.


```bash
$ brew install pyenv
$ pyenv install 3.11
$ pyenv global 3.11
$ pyenv versions
$ pyenv rehash
$ vi ~/.bash_profile
# Add:
export PATH="$HOME/.pyenv/bin:$PATH"
eval "$(pyenv init --path)"
eval "$(pyenv init -)"
$ source ~/.bash_profile
$ python --version
Python 3.11.9
$ python3 --version
Python 3.11.9
```

##### Apple Transporter
Electron injects `com.apple.security.device.print` and we must manually remove it.
```bash
npm i

// Remove com.apple.security.device.print
cd git/branta/node_modules/app-builder-lib/node_modules/\@electron/osx-sign/entitlements/
vi default.darwin.plist

// Remove com.apple.security.device.print
cd git/branta/node_modules/\@electron/osx-sign/entitlements/
vi default.darwin.plist
```
