const layout = { title: 'Original Signal', font:{size: 17}, yaxis: { title: 'Amplitude', fixedrange: true }, xaxis: { title: 'time', fixedrange: true, rangemode: 'tozero' }, width: 700 }; // fixedrange -> No pan when there is no signal
const plotDiv = document.getElementById('graph1');
const config = {
  displayModeBar: true, //disable plotlytool bar when there is no signal
}
Plotly.newPlot(plotDiv, [], layout, config);



const layout2 = { title: 'Reconstructed Signal',font:{size: 17}, yaxis: { title: 'Amplitude', fixedrange: true }, xaxis: { title: 'x', fixedrange: true, rangemode: 'tozero' }, width: 700 }; // fixedrange -> No pan when there is no signal
const plotDiv2 = document.getElementById('graph2');
const config2 = {
  displayModeBar: true, //disable plotlytool bar when there is no signal
}
Plotly.newPlot(plotDiv2, [], layout2, config2);

const layout3 = { title: 'Difference between Original and reconstructed',font:{size: 17}, yaxis: { title: 'y', fixedrange: true }, xaxis: { title: 'x', fixedrange: true, rangemode: 'tozero' }, width: 700 }; // fixedrange -> No pan when there is no signal
const plotDiv3 = document.getElementById('graph3');
const config3 = {
  displayModeBar: false, //disable plotlytool bar when there is no signal
}
Plotly.newPlot(plotDiv3, [], layout3, config3);


//variables for signal parameters
let Osignal = { amplitude: 0, freq: 0, x: [], y: [], name: "main_signal" };
let Stopper = false;
let LIstofComponent = {};
let Ctime = []; let Camplitude = [];
let FMAX;
let signalAmplitude;
let Timeee = [];
let Amplitude1 = [];
let numberofcomponents = 0;
let timeofthesignal = 5;
let stepsofthesignals = 0.001;
let NumOFADDEDsignals = 0;



//Function to extract title from file
function getTitleFromFileName(fileName) {
  // Split the file name at each dot
  const parts = fileName.split(".");

  // Return the first part of the array
  return parts[0];
}

//This function extracts max frequency specified in signal title
function extractFmaxFromTitle(title) {
  const regex = /freq\s*=\s*(\d+(?:\.\d+)?)/i;
  const match = regex.exec(title);
  if (match && match.length > 1) {
    return parseFloat(match[1]);
  } else {
    return null;
  }
}

/////DROPDOWN 
let signalsMenu = document.getElementById("addedcomponents");
signalsMenu.options.length = 0;




function importSignal() {
  // Get the selected file
  const fileInput = document.getElementById('sig');

  const fileName = fileInput.value.split(/(\\|\/)/g).pop();
  const title = getTitleFromFileName(fileName); //Extract title


  const file = fileInput.files[0];

  // Create a new FileReader object
  const reader = new FileReader();

  // Define a callback function to handle the file data
  reader.onload = (event) => {
    // Get the file data as a string
    const fileData = event.target.result;

    // Split the string into lines
    const lines = fileData.split(/\r?\n/);
    if (numberofcomponents > 0) { Plotly.deleteTraces(plotDiv, 0); }
    // Initialize arrays for the x and y values
    if (Stopper) {
      Plotly.deleteTraces(plotDiv, 1); Plotly.deleteTraces(plotDiv2, 0); Stopper = false;
    }
    if (NumOFADDEDsignals > 0) {
      Timeee = [];
      Amplitude1 = [];
      Camplitude = [];
      Ctime = [];
      // numberofcomponents=numberofcomponents-1;
      signalsMenu.options.length = 0;
      Plotly.deleteTraces(plotDiv, 0);


    }
    // Loop through the lines and split each line into columns
    for (let i = 0; i < lines.length; i++) {
      const columns = lines[i].split(',');


      ///other naming for signals that are put after components
      Ctime.push(parseFloat(columns[0]));
      Camplitude.push(parseFloat(columns[1]));
    }

    // Create a new trace for the signal data
    if (numberofcomponents == 0) {
      Timeee = [...Ctime];
      Amplitude1 = [...Camplitude];
      const trace = {
        x: Timeee,
        y: Amplitude1,
        name: "original",
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'green'
        },
      };
      let option = document.createElement("option");
      option.text = `Signal${numberofcomponents}  imported Signal`;
      option.value = `${Osignal["name"]}`;
      signalsMenu.appendChild(option);
      // Update the plot with the new trace
      Plotly.newPlot(plotDiv, [trace], layout, config);
      NumOFADDEDsignals = NumOFADDEDsignals + 1;
      Osignal.x = [...Timeee];
      Osignal.y = [...Amplitude1];
      LIstofComponent[Osignal["name"]] = Osignal;
      numberofcomponents = numberofcomponents + 1;

    }
    else {

      NumOFADDEDsignals = NumOFADDEDsignals + 1;
      Osignal['x'] = [...Ctime];
      Osignal['y'] = [...Camplitude];
      LIstofComponent[Osignal["name"]] = Osignal;
      let option = document.createElement("option");
      option.text = `Signal${numberofcomponents}  imported Signal`;
      option.value = `${Osignal["name"]}`;
      signalsMenu.appendChild(option);
      numberofcomponents = numberofcomponents + 1;
      for (let i = 0; i < 5000; i += 1) {
        Amplitude1[i] = Amplitude1[i] + Osignal['y'][i];
      }
      const trace = {
        x: Timeee,
        y: Amplitude1, name: "original",
        type: 'scatter',
        mode: 'lines',
        line: {
          color: 'blue'
        },
      };
      //Plotly.deleteTraces(plotDiv, 0);
      Plotly.newPlot(plotDiv, [trace], layout, config);

    }
  }
  // Read the file as text

  reader.readAsText(file);
}



//sampling the signal 

var SRSLider = document.getElementById("sampling");
var SROutput = document.getElementById("SROutput");

SROutput.innerHTML = SRSLider.value;
SROutput.innerHTML = SRSLider.value + " Hz";
///showing sampling rate
SRSLider.oninput = () => {
  SROutput.innerHTML = SRSLider.value + " Hz";
};

/////////actually sampling
let sampleX = [];
let sampleY = [];
let constructx = [];
let constructy = [];
SRSLider.addEventListener("mouseup", async function () {
  let fmaxviafft = 0;
  $(document).ready(function () {
    var array = Amplitude1;
    $.ajax({
      type: "POST",
      url: "/calculate-fft-max",
      contentType: "application/json; charset=utf-8",
      data: JSON.stringify(array),
      dataType: "json",
      success: function (data) {
        //$("#fft-max-magnitude").text(data.fftMaxMagnitude);
        console.log(data.fftMaxMagnitude); fmaxviafft = data.fftMaxMagnitude;
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus, errorThrown);
      }
    });
  });


  let samplingRate = SRSLider.value;
  sampleX = [];
  sampleY = [];

  let step = (Timeee.length) / Timeee[Timeee.length - 2] / (samplingRate); /////////// sampling step equation
  ////////// (samples * sampling period )


  let index

  for (let i = 0; i < Timeee.length; i += step) {
    index = Math.round(i) //saving x and y coordinates to demonstrate the samples
    sampleX.push(Timeee[index]);
    sampleY.push(Amplitude1[index]);
  }

  //console.log(sampleX.length);
  if (!Stopper) {
    Plotly.addTraces(plotDiv, { x: sampleX, y: sampleY, type: 'scatter', name: "sampled points", mode: 'markers', });
    Stopper = true;
  }
  else {
    Plotly.deleteTraces(plotDiv, 1);//Plotly.deleteTraces(plotDiv2, 0);
    Plotly.addTraces(plotDiv, { x: sampleX, y: sampleY, type: 'scatter', name: "sampled points", mode: 'markers', });

  }
  //RECONSTRUCTION
  // Resample using sinc interpolation
  constructx = [...Timeee];
  constructy = [];

  let Fs = samplingRate;
  //calculating the reconstructed signal using sinc interpolation
  for (let itr = 0; itr < Timeee.length; itr += 1) {
    let interpolatedValue = 0;
    for (let itrS = 0; itrS < sampleY.length; itrS += 1) {
      if (!isNaN(constructx[itr])) {
        let intrpolationComp =
          Math.PI * (constructx[itr] - itrS / (Fs)) * Fs;
        if (!isNaN(sampleY[itrS])) {
          interpolatedValue += sampleY[itrS] *
            (Math.sin(intrpolationComp) / intrpolationComp);
        }
      }
    }
    constructy.push(interpolatedValue);
  }





  //console.log(constructy);
  const trace = {
    x: constructx,
    y: constructy,
    type: 'scatter',
    mode: 'lines',
    line: {
      color: 'blue'
    },
    name: 'Reconstructed Signal'
  };
  Plotly.newPlot(plotDiv2, [trace], layout2, config2);
  Plotly.newPlot(plotDiv3, [trace], layout3, config3);
  Plotly.addTraces(plotDiv3, {
    x: Timeee, y: Amplitude1, type: 'scatter', name: "original", line: {
      color: 'red'
    }
  });
});



///Signal mixing
var ampSlider = document.getElementById("Amplitude");
var ampOutput = document.getElementById("ampOutput");
var freqSlider = document.getElementById("maxfreq");
var freqOutput = document.getElementById("freqOutput");
let addSignalBtn = document.getElementById("mixSignalbtn");
ampOutput.innerHTML = ampSlider.value;
freqOutput.innerHTML = freqSlider.value;
ampOutput.innerHTML = ampSlider.value + " mV";
freqOutput.innerHTML = freqSlider.value + " Hz";
ampSlider.oninput = () => {
  ampOutput.innerHTML = ampSlider.value + " mV";
};
freqSlider.oninput = () => {
  freqOutput.innerHTML = freqSlider.value + " Hz";
};

//generate signal funcntion
//let component={amplitude:0,freq:0, x :[],y :[],name:"freq="+0+",amp="+0};
function generate(amp, f, times = timeofthesignal, step = stepsofthesignals) {
  const exp = "amp * Math.sin(1*pi*x*f)";
  const pi = Math.PI;
  FMAX = f;
  signalAmplitude = amp;

  let xdata = [];
  let ydata = [];
  for (let x = 0; x <= times; x += step) {
    xdata.push(x);
    ydata.push(eval(exp));
  }
  var component = {};
  component["amplitude"] = amp;
  component["freq"] = f;
  component["x"] = [...xdata];
  component["y"] = ydata;
  component["name"] = "freq=" + f + ",amp=" + amp;
  LIstofComponent[component["name"]] = component;
  let option = document.createElement("option");
  option.text = `Signal${numberofcomponents}  ${component["name"]}`;
  option.value = `${component["name"]}`;
  signalsMenu.appendChild(option);


  return component;
}

mixSignalbtn.onclick = async () => {
  generatedsignal = generate(ampSlider.value, freqSlider.value);
  if (Stopper) { Plotly.deleteTraces(plotDiv, 1); Stopper = false; }
  if (numberofcomponents == 0) {
    Timeee = [...generatedsignal.x];
    Amplitude1 = [...generatedsignal.y];
    numberofcomponents = numberofcomponents + 1;


  }
  else {
    for (let i = 0; i < 5000; i += 1) {
      Amplitude1[i] = Amplitude1[i] + generatedsignal['y'][i];
    }
    numberofcomponents = numberofcomponents + 1;

  }

  const trace = {
    x: Timeee,
    y: Amplitude1,
    type: 'scatter', name: "original",
    mode: 'lines',
    line: {
      color: 'blue'
    },
  };
  if (numberofcomponents > 1) { Plotly.deleteTraces(plotDiv, 0); }

  // Update the plot with the new trace
  Plotly.newPlot(plotDiv, [trace], layout, config);
}

//////////////////////////////DELETE SECTION

let deleteBtn = document.getElementById("delete");


deleteBtn.onclick = async () => {
  if (Stopper) { Plotly.deleteTraces(plotDiv, 1); Plotly.deleteTraces(plotDiv2, 0); Plotly.deleteTraces(plotDiv3, 1); Plotly.deleteTraces(plotDiv3, 0); Stopper = false; }
  let deletedcomponent = signalsMenu.value;
  for (let i = 0; i < 5000; i += 1) {

    Amplitude1[i] = Amplitude1[i] - LIstofComponent[deletedcomponent].y[i];
  }
  delete LIstofComponent[deletedcomponent];
  numberofcomponents = numberofcomponents - 1;
  if (deletedcomponent == "main_signal") { NumOFADDEDsignals == NumOFADDEDsignals - 1; }
  signalsMenu.remove(signalsMenu.selectedIndex);
  Plotly.deleteTraces(plotDiv, 0);
  if (numberofcomponents == 0) {
    Amplitude1 = [];
  }
  const trace = {
    x: Timeee,
    y: Amplitude1, name: "original",
    type: 'scatter',
    mode: 'lines',
    line: {
      color: 'blue'
    },
  };
  Plotly.newPlot(plotDiv, [trace], layout, config);

}

//////////////////////NOISE
var snrSlider = document.getElementById("noise");
var snrOutput = document.getElementById("snrOutput");
let SNR = snrSlider.value;

snrSlider.oninput = async function () {
  snrOutput.innerHTML = snrSlider.value;

};
let noise_array = [];
snrSlider.addEventListener('mouseup', () => {
  noise_array = [];
  let SNR = snrSlider.value;


  //we calculate the average of the square values of y (aka the power)
  var sum_power = 0;
  for (let itr = 0; itr < Amplitude1.length; itr += 1) {

    if (!isNaN(Amplitude1[itr])) //ignore Nans
    {
      let powerComponent = Math.pow(Amplitude1[itr], 2);
      sum_power += powerComponent;
    }

  }

  //then we get the average of the power (divide by the number of values)
  let signal_power = Math.sqrt(sum_power / Amplitude1.length);


  //we add a random noise component based on the SNR to the signal values
  for (let itr = 0; itr < Amplitude1.length; itr += 1) {
    let noiseComponent = this.getNormalDistRand(0, signal_power / SNR);

    Amplitude1[itr] = Amplitude1[itr] + noiseComponent;
    noise_array.push(noiseComponent);
  }



  const trace = {
    x: Timeee,
    y: Amplitude1, name: "original",
    type: 'scatter',
    mode: 'lines',
    line: {
      color: 'blue'
    },
  };
  Plotly.newPlot(plotDiv, [trace], layout, config); Stopper = false;


});
/////////////////////////////////////////////////////////////
//////////////////DELETE
let deletenoise = document.getElementById("deletenoise");
deletenoise.onclick = async () => {
  let withoutnoise = [];
  for (let purecounter = 0; purecounter < Amplitude1.length; purecounter++) {
    withoutnoise.push(0);///initialise array
  }
  var keys = Object.keys(LIstofComponent);
  //console.log(components_list[keys[0]]);
  for (let sig_compo = 0; sig_compo < keys.length; sig_compo++) {
    for (let i = 0; i < Amplitude1.length; i++) {
      withoutnoise[i] = withoutnoise[i] + LIstofComponent[keys[sig_compo]].y[i];

    }
  }
  //console.log(withoutnoise);
  Amplitude1 = withoutnoise;
  const trace = {
    x: Timeee,
    y: Amplitude1, name: "original",
    type: 'scatter',
    mode: 'lines',
    line: {
      color: 'blue'
    },
  };
  Plotly.newPlot(plotDiv, [trace], layout, config);
}
//For generating a gaussian distributed variable
function boxMullerTransform() {
  const u1 = Math.random();
  const u2 = Math.random();

  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

  return { z0, z1 };
  // return z0;
}
function getNormalDistRand(mean, stddev) {
  const { z0, _ } = boxMullerTransform();
  return z0 * stddev + mean;
}

//////////////////////////Saving 
let saveBtn = document.getElementById("save");
function saveCSV(x, y) {
  let csvData = [];
  for (let i = 0; i < x.length; i += 1) {
    csvData.push([x[i], y[i]]);
  }
  return csvData;
}
let downloadLink = document.getElementById("download");
saveBtn.onclick = () => {
  let csvData = [];

  csvData = saveCSV(Timeee, Amplitude1);

  let csv = "time,amplitude\n";
  //merge the data with CSV
  csvData.forEach(function (row) {
    csv += row.join(",");
    csv += "\n";
  });
  //display the created CSV data on the web browser
  downloadLink.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  //provide the name for the CSV file to be downloaded
  downloadLink.download = "Signal.csv";
};