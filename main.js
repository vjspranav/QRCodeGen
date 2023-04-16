// initialise pyodide, the js is already loaded
// in the html file

const generateQRCode = async (input_text, pyodide) => {
  const pythonCode = `import io
import base64
import qrcode

# Create a QR code object
qr = qrcode.QRCode(
    version=1,
    error_correction=qrcode.constants.ERROR_CORRECT_L,
    box_size=10,
    border=4,
)

# Add the data (URL) to the QR code
qr.add_data("${input_text}")
qr.make(fit=True)

# Create an image of the QR code
img = qr.make_image(fill_color="black", back_color="white")

# Convert the image to a base64 string
buffer = io.BytesIO()
img.save(buffer, format="PNG")
img_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
img_str`;

  // run the python code
  const b64_qr = await pyodide.runPythonAsync(pythonCode);

  // create a data url from the base64 string
  const dataUrl = `data:image/png;base64,${b64_qr}`;

  // Add to div by id image-container
  const imageContainer = document.getElementById("ic");
  imageContainer.innerHTML = `<img src="${dataUrl}" />`;
};

const addToImageContainer = (b64) => {};

const initialisePyodide = async () => {
  const genButton = document.getElementById("generate");
  const downloadButton = document.getElementById("download");

  // disable download button
  downloadButton.disabled = true;

  // Show loading and hide container class
  // create loading div
  const loadingDiv = document.createElement("div");
  loadingDiv.className = "loading";
  loadingDiv.innerHTML = "Loading Website...";
  document.body.appendChild(loadingDiv);

  // hide container
  const container = document.getElementsByClassName("container");
  container[0].style.display = "none";

  const pyodide = await loadPyodide({
    stdOut: (text) => console.log(text),
    stdErr: (text) => console.log(text),
  });

  await pyodide.loadPackage("micropip");
  const micropip = pyodide.pyimport("micropip");

  // install the package also Pillow
  await micropip.install("Pillow");
  await micropip.install("qrcode");

  console.log("Pyodide is ready to use!");

  // Add onclick event to button
  genButton.onclick = () => {
    const input = document.getElementById("input");
    console.log(input.value);
    generateQRCode(input.value, pyodide);
    downloadButton.disabled = false;
  };

  // Remove loading div and show container
  loadingDiv.remove();
  container[0].style.display = "block";

  // Download the QR code
  downloadButton.onclick = () => {
    // Get base64 string from image
    const image = document.getElementById("ic").firstChild;
    const base64 = image.src.split(",")[1];
    // Create a link
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${base64}`;
    link.download = "qrcode.png";
    link.click();
  };
};

initialisePyodide();
