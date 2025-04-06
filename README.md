<img src="https://github.com/user-attachments/assets/2f30a41c-0067-4832-b942-956b9a9363df" width="200">
<img src="https://github.com/user-attachments/assets/62e9ae09-cdf3-4ea2-899b-b4a77ca779d6" width="500">

Transform your fridge into ✨**Fridg-E**✨ *(yes this is a reference to Wall-E)*. Fridg-E helps you track the items in your fridge to help you reduce the amount of food that gets wasted. 

**Easily trivialize being environomentally conscious while still eating good by letting Fridg-E keep track of your calories, carbon footprint, and even generate recipes that prioritizes using ingredients before they expire.**

## Setup Webapp Locally
Prerequisites: `node.js`

1. **Clone project and install dependencies:**
   
   Run ```git clone``` to clone this repo.
   Then run ```npm i``` to install all dependencies 

3. **Run project locally:**

   Run ```npm run dev``` or ```npm start```

## Camera Setup (Linux):
Prerequisites packages: 
- python 3.11
- python3.11-venv
- python3.11-dev

Optional for remote camera:
- v4l2loopback-dkms
- v4l2loopback-utils
- obs-studio-git

*NOTE:  rolling release of `v4l2loopback` is broken on Arch at the moment you will need to downgrade*

## Steps

*NOTE: Make sure to change into the `/objectDetection` directory before doing these steps*

1.  (Optional Remote Camera) **Setup OBS Virtual Camera:**
   
    Open OBS studio and set up a `Browser` source. Input link made from [https://vdo.ninja/](https://vdo.ninja/) on a mobile device with a camera.
    Start virtual camera.
    
3.  (Optional Remote Camera) **Identify OBS Camera Device:**
    ```bash
    v4l2-ctl --list-devices
    ```
    Note the `/dev/videoX` path for the OBS Virtual Camera.

4.  **Configure Camera:**
    * Edit `main.py` and set the camera device variable to the correct `/dev/videoX` path found above.

5.  **Install:**
    We've included a make file for quick installation with a virtual python environment
    ```bash
    make install
    ```

6.  **Activate Environment:**
    ```bash
    source .venv/bin/activate
    ```
7.  Open your firebase project console and generate a new private key as a JSON. Save it into this directory.

8.  **Run Script:**
    * Ensure OBS Virtual Camera is running. 
    * Ensure `.venv` is active.
    ```bash
    python main.py
    ```
