var example = example || {};





(function () {
    "use strict";

    //-----------------WebMidi----------------
    let outputMidiControl;

    WebMidi.enable(function (err) { //check if WebMidi.js is enabled

        if (err) {
            console.log("WebMidi could not be enabled.", err);
        } else {
            console.log("WebMidi enabled!");
        }

        //name our visible MIDI input and output ports
        console.log("---");
        console.log("Inputs Ports: ");
        for (let i = 0; i < WebMidi.inputs.length; i++) {
            console.log(i + ": " + WebMidi.inputs[i].name);
        }
        console.log("---");
        console.log("Output Ports: ");
        for (let i = 0; i < WebMidi.outputs.length; i++) {
            console.log(i + ": " + WebMidi.outputs[i].name);
        }

        if (WebMidi.outputs.length > 0) {
            outputMidiControl = WebMidi.outputs[0];
        }
    });


    var freqTransform = function (value) {
        return (value * 6000) + 60;
    };

    var identityTransform = function (value) {
        return value;
    };

    var carrierSpec = {
        freq: {
            inputPath: "carrier.freq.value",
            transform: freqTransform
        },
        mul: {
            inputPath: "carrier.mul",
            transform: identityTransform
        }
    };

    var modulatorSpec = {
        freq: {
            inputPath: "modulator.freq.value",
            transform: freqTransform
        },
        mul: {
            inputPath: "modulator.mul",
            transform: freqTransform
        }
    };

    example.SocketSynth = function () {
        this.oscPort = new osc.WebSocketPort({
            url: "ws://142.93.191.104:8100"
        });

        this.listen();
        this.oscPort.open();

        this.oscPort.socket.onmessage = function (e) {
            console.log("message", e);
        };

        this.valueMap = {
            "/knobs/0": carrierSpec.freq,
            "/fader1/out": carrierSpec.freq,

            "/knobs/1": carrierSpec.mul,
            "/fader2/out": carrierSpec.mul,

            "/knobs/2": modulatorSpec.freq,
            "/fader3/out": modulatorSpec.freq,

            "/knobs/3": modulatorSpec.mul,
            "/fader4/out": modulatorSpec.mul
        };
    };

    example.SocketSynth.prototype.createSynth = function () {
        if (this.synth) {
            return;
        }

        this.synth = flock.synth({
            synthDef: {
                id: "carrier",
                ugen: "flock.ugen.sin",
                freq: {
                    ugen: "flock.ugen.value",
                    rate: "audio",
                    value: 400,
                    add: {
                        id: "modulator",
                        ugen: "flock.ugen.sin",
                        freq: {
                            ugen: "flock.ugen.value",
                            rate: "audio",
                            value: 124
                        },
                        mul: 100
                    }
                },
                mul: 0.3
            }
        });
    };

    example.SocketSynth.prototype.listen = function () {
        var that = this;
        $("button").click(function () {
            that.createSynth();
            that.play();
        });

        this.oscPort.on("message", this.mapMessage.bind(this));
        this.oscPort.on("message", function (msg) {
            console.log("message", msg);
        });
        this.oscPort.on("close", this.pause.bind(this));
    };

    example.SocketSynth.prototype.play = function () {
        this.synth.play();
    };

    example.SocketSynth.prototype.pause = function () {
        this.synth.pause();
    };

    example.SocketSynth.prototype.mapMessage = function (oscMessage) {
        $("#message").text(fluid.prettyPrintJSON(oscMessage));


        var address = oscMessage.address;
        var value = oscMessage.args[0];

        //control fliud synth in the browser
        var transformSpec = this.valueMap[address];

        if (transformSpec) {
            // console.log(transformSpec)
            var transformed = transformSpec.transform(value);
            this.synth.set(transformSpec.inputPath, transformed);
        }

        //send out midi
        if (outputMidiControl) {
            if (address == "/midi/note") {
                outputMidiControl.playNote(value)
            }
        }
    };

}());
