# Import the necessary modules
import numpy as np
from scipy.fft import fft
from flask import Flask, render_template,request, jsonify

# Create the Flask app
app = Flask(__name__)

# Define the route and the HTTP method this endpoint will listen to
# In this case, we want to receive POST requests to the '/calculate-fft-max' endpoint
@app.route('/calculate-fft-max', methods=['POST'])

# Define the function that will be called when the endpoint is reached
def calculate_fft_max():

    # Get the array from the request object
    # The request object contains all the information about the request
    # In this case, the array will be in the body of the request
    array = request.get_json()

    # Calculate the FFT of the array
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

    # Return the maximum frequency in JSON format
    return jsonify({'fftMaxMagnitude': max_frequency})