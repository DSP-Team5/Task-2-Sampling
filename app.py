from flask import Flask, render_template,request, jsonify
import numpy as np
from scipy.fft import fft

app = Flask(__name__)

@app.route('/')
def Sampling_Studio():
    return render_template('main.html')

@app.route('/calculate-fft-max', methods=['POST'])
def calculate_fft_max():
    array = request.get_json()
    fft = np.fft.fft(array)

# Get the magnitudes of the FFT coefficients
    fft_magnitudes = np.abs(fft)

    # Get the frequencies corresponding to the FFT coefficients
    sampling_rate = 1000  # This is the number of samples per second
    frequencies = np.fft.fftfreq(len(fft_magnitudes), 1 / sampling_rate)

    # Get the index of the maximum magnitude of the FFT coefficients
    max_magnitude_index = np.argmax(fft_magnitudes)

    # Get the frequency corresponding to the maximum magnitude
    max_frequency = frequencies[max_magnitude_index]
    return jsonify({'fftMaxMagnitude': max_frequency})

if __name__ == '__main__':
    app.run(debug=True)