sink_name="$2"
card_number=""

function volUp {
	pactl set-sink-volume $sink_name +5%
}

function volDown {
	pactl set-sink-volume $sink_name -5%
}

function togmute {
	pactl set-sink-mute $sink_name toggle
}

function listen {
	# once we get here, the sink definetely exists, so we can output its
	# status once to get an initial state.
	
	output

	# i would actually just grep for "sink #$sink_number" here, but whenever a sink is 
	# disabled/disconnected and enabled again, it gets a new index. However, pactl
	# is still grepping for the old $sink_number so we have check for that IN the while loop
	
	pactl subscribe | grep --line-buffered 'sink #\|card' | while read -r event; do
		if [[ $event =~ "sink #$sink_number" ]]
		then 
			output
			
		else 
			if [[ $event =~ card ]]
			then
				if [[ $(getIndexForce) == "" ]]
				then
					echo ""
					sink_number=$(waitForSinkConnect) && output
				fi
			fi
		fi
	done
}

function output {
	if [[ $(getMute) == "no" ]]
	then
		echo "$icon_unmuted $(getVolume)"
	else
		echo "$icon_muted"
	fi
}

function getMute {
	pactl get-sink-mute $sink_name | awk '{print $2}'
}

function getVolume {
	pactl get-sink-volume $sink_name | head -n1 | awk '{print $5}'
}

function getIndex {

	# i should probably convert every use of this to getIndexForce
	
	if [[ $(getIndexForce) == "" ]]
	then
		echo $(waitForSinkConnect)
	else
		echo $index
	fi
}

function getIndexForce {
	echo $(pactl list sinks | grep -B 2 $sink_name | head -n1 | tr -dc '0-9')
}

function waitForSinkConnect {
	expect <(cat <<'EOD'
spawn pactl subscribe; expect card
EOD
) > /dev/null 2>&1  
	echo $(getIndex)
}

case "$1" in
    --up)
        volUp
        ;;
    --down)
        volDown
        ;;
    --togmute)
    	togmute
        ;;
    --listen)

		case "$2" in
			combined)
				icon_muted=""
				icon_unmuted=""
				;;
			alsa_output.pci-0000_00_1f.3.analog-stereo)
				icon_muted=""
				icon_unmuted=""
				;;
			alsa_output.pci-0000_03_00.1.hdmi-stereo)
				card_number="0"
				icon_muted=""
				icon_unmuted=""
				;;
			bluez_sink.07_08_24_00_06_FC.a2dp_sink)
				card_number="4"
				icon_muted=""
				icon_unmuted=""
				;;
			*)
				icon_muted=""
				icon_unmuted=""
				;;
		esac

		sink_number=$(getIndex) && listen
        ;;
    *)
        output
        ;;
esac
