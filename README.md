# osc-relay

An web example about relaying UDP OSC messages sent to 142.93.191.104:12345 (which is a UDP port on my digital ocean droplet) to all web socket clients connected to 142.93.191.104:8100 (which is a web socket server on my digital ocean droplet).

To install:

1. Download the repo, cd to it, and "npm install"
2. Serve the directory with a local http server
3. Open the index.html with your browser (e.g. localhost:8080/index.html)
4. It'll receive OSC messages sent from 142.93.191.104:8100, then read values of the "/midi/note" address, and send the value to the first MIDI output port it finds (to check this open console in your browser and look for output ports). 
5. For now, you can modify the index of "outputMidiControl = WebMidi.outputs[(put your midi port index here)]" to your desired midi port in the socket-synth.js, so that you can route the midi message out to wherever you want. Bind Midi Port by name feature will be added later.
