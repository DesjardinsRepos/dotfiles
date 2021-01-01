###
# ~/.bashrc
#

[[ $- != *i* ]] && return
PS1='[\u@\h \W]\$ '

# OS - stuff

    alias generatePackageList='pacman -Qe | awk "{print $1}" > package_list.txt'
    alias installFromList='yay --sudoloop -S - < package_list.txt'
    alias importkey='gpg --keyserver pool.sks-keyservers.net --recv-keys'
    alias yay='yay --sudoloop'
    alias scan='scanimage --format=png --output-file scanout.png --progress'
    alias sync='sync & watch -n 1 grep -e Dirty: /proc/meminfo'
    alias syncstate='watch -d grep -e Dirty: -e Writeback: /proc/meminfo'
    alias trash='trash-put'
    alias gofind='sudo find / -name'
    alias ls='ls --color=auto'

# exported scripts

    alias burn='sudo bash /home/desjardins/permanent/public/bash/burn.sh'
    alias lsalias='/home/desjardins/permanent/public/bash/lsalias.sh'
    alias lsec='sudo bash /home/desjardins/permanent/private/bash/.lsec.sh'
    alias topdf='/home/desjardins/permanent/public/bash/topdf.sh'
    alias fixdiscord='/home/desjardins/permanent/public/bash/Mon2Cam'
    alias getUrl='bash /home/desjardins/permanent/public/bash/getUrl.sh "$@"'

# personal

    alias ytdl='youtube-dl'
    alias chill='mpa https://www.youtube.com/watch?v=5qap5aO4i9A'
    alias mpa='mpv --volume=50 --no-video --force-seekable=yes'
    
    cl() { 
        git clone https://github.com/"$1".git; 
    }

    ytdl-play() {
        echo "$@" > tmp.ytdl-play; 
        bash /home/desjardins/permanent/public/bash/getUrl.sh tmp.ytdl-play;
        mpv "$(< tmp.ytdl-play)" & rm tmp.ytdl-play;
    }
    
    ytdl-use-name() { 
        echo "$@" > tmp.ytdl-use-name;  
        bash /home/desjardins/permanent/public/bash/getUrl.sh tmp.ytdl-use-name;
        youtube-dl -a tmp.ytdl-use-name;
        rm tmp.ytdl-use-name;
    }
    
        
    getSurvey() {
        curl https://europe-west1-semi-umfrage.cloudfunctions.net/api/getEntries1 > data.json && prettier -w data.json
        less data.json
        echo entries: $(grep date data.json | wc -l)
    }

    get() {
        #assign colors
        b=`tput setaf 4`
        res=`tput sgr0`

        #assign all matches
        OUT=$(sudo grep -oP "$*\K.*" /home/desjardins/permanent/private/bash/.pw.conf)
        
        #copy text to clipboard
        sudo grep -oP "$*\K.*" /home/desjardins/permanent/private/bash/.pw.conf | xclip -selection clipboard
        
        #print output
        echo "copied ${b}${#OUT} char(s)${res} long password to clipboard for parameter(s) ${b}$*${res}"
    }

    twitch() { mpv https://www.twitch.tv/$1; }

    execnode() {
        #add eval to js file
        echo "eval(process.argv[2]);" >> $1
        
        #execute it
        node $1 "$2"

        #delete last line from file
        tail -n 1 "$1" | wc -c | xargs -I {} truncate "$1" -s -{}
    }

    combineTextInFolder() {
        $(rm -f combined.json)
        files=$(ls *.txt)
        $(cat begin.json $files end.json > combined.json) 
    }

    pngpdf() { for file in "$@"; do $(convert "$file" "${file:0:${#file}-4}.pdf"); done; }

    convertvid() { for file in "$@"; do $(ffmpeg -i "$file" "${file:0:${#file}-4}.mp3"); done; }

    dllist() { bash /home/desjardins/permanent/public/bash/getUrl.sh "$1" && youtube-dl -a "$1"; }

# IOS

    alias ios-pair='idevicepair pair'
    alias ios-mount='ifuse -o allow_other -o nonempty /home/desjardins/IphoneMount'
    alias ios-umount='sudo umount /home/desjardins/IphoneMount'
    alias ios-umount-force='sudo umount -l /home/desjardins/IphoneMount'
    alias ios-status='ls -a /home/desjardins/IphoneMount'

# Windscribe

    alias w='windscribe'
    alias wstart='sudo systemctl start windscribe'
    alias startw='sudo systemctl start windscribe && windscribe connect best'
    alias stopw='windscribe disconnect && sudo systemctl stop windscribe'


neofetch --colors 4 4 7 4 7 7 --ascii_colors 12 4

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
