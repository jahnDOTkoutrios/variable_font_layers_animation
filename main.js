document.addEventListener("DOMContentLoaded", () => {
  const layers = [
    document.getElementById("layer1"),
    document.getElementById("layer2"),
    document.getElementById("layer3"),
  ];

  // Set initial colors
  layers.forEach((layer, index) => {
    const colors = ["#0b2279", "#8397eb", "#3d4a42"];
    layer.style.color = colors[index];
  });

  // Set initial layer states and animation values
  const layerSettings = [
    { weight: 1, width: 0.5, visible: true },
    { weight: 2, width: 1, visible: true },
    { weight: 1.5, width: 2, visible: true },
  ];

  layers.forEach((layer, index) => {
    const settings = layerSettings[index];
    const baseDuration = 3; // Base duration in seconds

    // Set visibility
    layer.style.opacity = settings.visible ? "1" : "0";
    layer.style.pointerEvents = settings.visible ? "auto" : "none";

    // Set animation durations
    layer.style.setProperty(
      "--weight-duration",
      `${baseDuration / settings.weight}s`
    );
    layer.style.setProperty(
      "--width-duration",
      `${baseDuration / settings.width}s`
    );

    // Set initial animation timing function
    layer.style.animationTimingFunction =
      "cubic-bezier(0.95, 0.05, 0.795, 0.035)";
  });

  // Handle text size
  const textSizeInput = document.getElementById("textSizeInput");
  const textSizeValue = document.getElementById("textSizeValue");
  textSizeInput.addEventListener("input", (e) => {
    const size = e.target.value;
    textSizeValue.textContent = `${size} px`;
    layers.forEach((layer) => {
      layer.style.fontSize = `${size}px`;
    });
  });

  // Set initial size
  layers.forEach((layer) => {
    layer.style.fontSize = "250px";
  });

  // Handle color picker changes
  document.querySelectorAll(".color-picker").forEach((picker) => {
    picker.addEventListener("input", (e) => {
      const wrapper = e.target.closest(".color-dot-wrapper");
      const layer = wrapper.dataset.layer;
      const color = e.target.value;
      const dot = wrapper.querySelector(".color-dot");

      // Update dot color
      dot.style.background = color;

      // Update layer color or background
      if (layer === "bg") {
        document.body.style.backgroundColor = color;
      } else {
        const layerElement = document.getElementById(`layer${layer}`);
        if (layerElement) {
          layerElement.style.color = color;
        }
      }

      // Update CSS variable if color animation is active
      if (document.querySelector(".color-dot").classList.contains("selected")) {
        document.documentElement.style.setProperty(
          `--layer-${layer}-color`,
          color
        );
      }
    });
  });

  // Set initial background color
  const bgColorPicker = document.querySelector(
    '.color-dot-wrapper[data-layer="bg"] .color-picker'
  );
  document.body.style.backgroundColor = bgColorPicker.value;

  // Handle text input and update all layers
  layers.forEach((layer) => {
    layer.addEventListener("input", (e) => {
      // Save selection
      const selection = window.getSelection();
      const range = selection.getRangeAt(0);
      const startContainer = range.startContainer;
      const startOffset = range.startOffset;
      const endContainer = range.endContainer;
      const endOffset = range.endOffset;
      const isCollapsed = range.collapsed;

      // Get the text content with line breaks preserved
      const text = layer.textContent;

      // Update all layers first to ensure synchronization
      layers.forEach((l) => {
        if (l !== layer) {
          // Store current animation properties
          const isSequential = l.classList.contains("sequential");
          const layerSpeed = parseFloat(l.style.animationDuration) || 3;
          const layerTiming = l.style.animationTimingFunction;

          // First update the text content
          l.textContent = text;

          // If in sequential mode, rebuild spans
          if (isSequential) {
            // Clear and rebuild the content
            l.innerHTML = "";

            // Create spans for each character, preserving line breaks
            for (let i = 0; i < text.length; i++) {
              const span = document.createElement("span");
              span.textContent = text[i];
              span.style.animationDuration = `${layerSpeed}s`;
              span.style.animationDelay = `${i * 0.3}s`;
              span.style.animationTimingFunction = layerTiming;
              span.style.setProperty("--weight-duration", `${layerSpeed}s`);
              span.style.setProperty("--width-duration", `${layerSpeed}s`);
              l.appendChild(span);
            }
          }
        }
      });

      // Update spans for the active layer if in sequential mode
      if (layer.classList.contains("sequential")) {
        // Store the current animation properties
        const layerSpeed = parseFloat(layer.style.animationDuration) || 3;
        const layerTiming = layer.style.animationTimingFunction;

        // Clear and rebuild the content
        layer.innerHTML = "";

        // Create spans for each character, preserving line breaks
        for (let i = 0; i < text.length; i++) {
          const span = document.createElement("span");
          span.textContent = text[i];
          span.style.animationDuration = `${layerSpeed}s`;
          span.style.animationDelay = `${i * 0.3}s`;
          span.style.animationTimingFunction = layerTiming;
          span.style.setProperty("--weight-duration", `${layerSpeed}s`);
          span.style.setProperty("--width-duration", `${layerSpeed}s`);
          layer.appendChild(span);
        }

        // Try to restore selection
        try {
          const newRange = document.createRange();

          // Find the start and end nodes
          const startNode =
            layer.childNodes[
              Math.min(startOffset, layer.childNodes.length - 1)
            ] || layer;
          const endNode = isCollapsed
            ? startNode
            : layer.childNodes[
                Math.min(endOffset, layer.childNodes.length - 1)
              ] || layer;

          // Set the range
          newRange.setStart(startNode, 0);
          if (!isCollapsed) {
            newRange.setEnd(endNode, endNode.textContent.length);
          }

          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (error) {
          console.log("Error restoring selection:", error);
        }
      } else {
        // For non-sequential mode, just restore the cursor position
        try {
          const newRange = document.createRange();
          newRange.setStart(startContainer, startOffset);
          if (!isCollapsed) {
            newRange.setEnd(endContainer, endOffset);
          }
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (error) {
          console.log("Error restoring cursor position:", error);
        }
      }
    });

    // Handle paste events to preserve formatting
    layer.addEventListener("paste", (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    });

    // Handle keydown events to ensure consistent line break handling
    layer.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        document.execCommand("insertLineBreak");
      }
    });
  });

  // Handle speed dots
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("speed-dot")) {
      const speed = parseFloat(e.target.dataset.speed);
      const layer = e.target.parentElement.dataset.layer;
      const axis = e.target.parentElement.dataset.axis;

      // Get all dots in the group
      const parentDots = e.target.parentElement;
      const dots = Array.from(parentDots.querySelectorAll(".speed-dot"));
      const clickedIndex = dots.indexOf(e.target);

      // Reset all dots
      dots.forEach((dot) => {
        dot.classList.remove("selected", "filled");
      });

      // Fill dots up to and including the clicked one
      dots.forEach((dot, index) => {
        if (index <= clickedIndex) {
          dot.classList.add("filled");
        }
      });

      // Add selected class to clicked dot
      e.target.classList.add("selected");

      // Update animation duration
      const layerElement = document.getElementById(`layer${layer}`);
      const baseDuration = 3; // Base duration in seconds

      if (axis === "weight") {
        layerElement.style.setProperty(
          "--weight-duration",
          `${baseDuration / speed}s`
        );
      } else if (axis === "width") {
        layerElement.style.setProperty(
          "--width-duration",
          `${baseDuration / speed}s`
        );
      }

      // Update spans if in sequential mode
      if (layerElement.classList.contains("sequential")) {
        const spans = layerElement.querySelectorAll("span");
        spans.forEach((span) => {
          if (axis === "weight") {
            span.style.setProperty(
              "--weight-duration",
              `${baseDuration / speed}s`
            );
          } else if (axis === "width") {
            span.style.setProperty(
              "--width-duration",
              `${baseDuration / speed}s`
            );
          }
        });
      }
    }
  });

  // Handle curve selection
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("curve-dot")) {
      // Toggle selected class
      e.target.classList.toggle("selected");
      const isExp = e.target.classList.contains("selected");

      // Update animation timing function for all layers
      layers.forEach((layer) => {
        layer.style.animationTimingFunction = isExp
          ? "cubic-bezier(0.95, 0.05, 0.795, 0.035)"
          : "ease-in-out";
      });
    }
  });

  // Handle mode selection
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("mode-dot")) {
      // Toggle selected class
      e.target.classList.toggle("selected");
      const isSequential = e.target.classList.contains("selected");

      // Update animation mode for all layers
      layers.forEach((layer) => {
        // Remove both mode classes
        layer.classList.remove("simultaneous", "sequential");

        // Add the new mode class
        layer.classList.add(isSequential ? "sequential" : "simultaneous");

        // Handle the text content based on mode
        if (isSequential) {
          // For sequential mode, we'll let updateLetterSpans handle the content
          updateLetterSpans();
        } else {
          // For simultaneous mode, ensure we have clean text without spans
          const text = layer.innerHTML;
          layer.innerHTML = text.replace(/<span[^>]*>(.*?)<\/span>/g, "$1");
        }
      });
    }
  });

  // Function to wrap each letter in a span
  function updateLetterSpans() {
    layers.forEach((layer) => {
      // Only process visible layers that are in sequential mode
      if (
        layer.classList.contains("sequential") &&
        layer.style.opacity !== "0"
      ) {
        const text = layer.textContent; // Use textContent instead of innerHTML
        const weightDuration =
          layer.style.getPropertyValue("--weight-duration") || "3s";
        const widthDuration =
          layer.style.getPropertyValue("--width-duration") || "3s";
        const layerTiming = layer.style.animationTimingFunction;

        // Clear the layer content
        layer.innerHTML = "";

        // Create spans for each character
        for (let i = 0; i < text.length; i++) {
          const span = document.createElement("span");
          span.textContent = text[i];
          span.style.animationDuration = `${weightDuration}, ${widthDuration}`;
          span.style.animationDelay = `${i * 0.3}s`;
          span.style.animationTimingFunction = layerTiming;
          span.style.setProperty("--weight-duration", weightDuration);
          span.style.setProperty("--width-duration", widthDuration);
          layer.appendChild(span);
        }
      }
    });
  }

  // Initial setup
  updateLetterSpans();

  // Handle shadow toggle
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("shadow-dot")) {
      const isOn = e.target.classList.contains("selected");

      // Toggle selected class
      e.target.classList.toggle("selected");

      // Update shadow for all layers
      layers.forEach((layer) => {
        layer.style.textShadow = isOn
          ? "none"
          : "1px 1px 2px rgba(0, 0, 0, 0.2)";
      });
    }
  });

  // Handle multiply toggle
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("multiply-dot")) {
      const isOn = e.target.classList.contains("selected");

      // Toggle selected class
      e.target.classList.toggle("selected");

      // Update mix-blend-mode for all layers
      layers.forEach((layer) => {
        layer.style.mixBlendMode = isOn ? "normal" : "multiply";
      });
    }
  });

  // Export functionality
  const exportButton = document.querySelector(".export-button");
  const exportOptions = document.querySelector(".export-options");

  exportButton.addEventListener("click", () => {
    exportOptions.classList.toggle("show");
  });

  // Close export options when clicking outside
  document.addEventListener("click", (e) => {
    if (
      !e.target.closest(".export-button") &&
      !e.target.closest(".export-options")
    ) {
      exportOptions.classList.remove("show");
    }
  });

  // Export as Video
  document.querySelectorAll(".export-option").forEach((option) => {
    option.addEventListener("click", async () => {
      const duration = parseInt(option.dataset.duration) * 1000; // Convert to milliseconds
      const exportButton = document.querySelector(".export-button");

      // Add loading state
      exportButton.classList.add("loading");
      exportOptions.classList.remove("show");

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas size based on mode
      const scale = 2; // Scale factor for higher resolution
      if (isImageMode) {
        // In image mode, use the canvas container dimensions
        canvas.width = canvasContainer.offsetWidth * scale;
        canvas.height = canvasContainer.offsetHeight * scale;
      } else {
        // In normal mode, use window dimensions
        canvas.width = window.innerWidth * scale;
        canvas.height = window.innerHeight * scale;
      }

      // Scale the context to match the higher resolution
      ctx.scale(scale, scale);

      // Get supported mime type
      const mimeTypes = ["video/webm;codecs=vp8", "video/webm", "video/mp4"];
      let selectedMimeType = "";
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      if (!selectedMimeType) {
        alert("Video recording is not supported in your browser.");
        exportButton.classList.remove("loading");
        return;
      }

      const stream = canvas.captureStream(60); // 60 FPS for smoother animation
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: 8000000, // 8 Mbps for higher quality
      });
      const chunks = [];

      // Start recording
      mediaRecorder.start();

      const startTime = Date.now();

      async function draw() {
        // Clear canvas
        ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
        ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

        if (isImageMode) {
          // Draw the image canvas with blur
          const imageCanvas = document.getElementById("imageCanvas");
          ctx.drawImage(
            imageCanvas,
            0,
            0,
            canvas.width / scale,
            canvas.height / scale
          );
        }

        // Draw text layers
        for (const layer of layers) {
          // Create a temporary canvas for each layer
          const layerCanvas = document.createElement("canvas");
          const layerCtx = layerCanvas.getContext("2d");

          // Set the temporary canvas size to match the layer
          const rect = layer.getBoundingClientRect();
          layerCanvas.width = rect.width * scale;
          layerCanvas.height = rect.height * scale;
          layerCtx.scale(scale, scale);

          // Draw the layer content
          const html = layer.innerHTML;
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = html;
          tempDiv.style.position = "absolute";
          tempDiv.style.left = "-9999px";
          tempDiv.style.top = "-9999px";
          document.body.appendChild(tempDiv);

          // Apply the same styles as the original layer
          tempDiv.style.fontFamily = getComputedStyle(layer).fontFamily;
          tempDiv.style.fontSize = getComputedStyle(layer).fontSize;
          tempDiv.style.color = getComputedStyle(layer).color;
          tempDiv.style.whiteSpace = "pre-wrap";
          tempDiv.style.textAlign = "center";

          // Calculate the current animation state
          const currentTime = (Date.now() - startTime) / 1000;
          const layerDelay = parseFloat(layer.style.animationDelay) || 0;
          const layerSpeed = parseFloat(layer.style.animationDuration) || 3;
          const time = (currentTime - layerDelay) % layerSpeed;
          const progress = time / layerSpeed;
          const weight = 101 + 99 * Math.sin(progress * Math.PI);

          // Apply the current animation state
          tempDiv.style.fontVariationSettings = `"wght" ${weight}`;

          // Convert the HTML to an image
          const dataUrl = await html2canvas(tempDiv, {
            scale: scale,
            backgroundColor: null,
            logging: false,
            useCORS: true,
          }).then((canvas) => canvas.toDataURL());

          // Remove the temporary div
          document.body.removeChild(tempDiv);

          // Draw the layer image onto the main canvas
          const img = new Image();
          img.src = dataUrl;
          await new Promise((resolve) => {
            img.onload = () => {
              // Calculate center position
              const centerX = canvas.width / scale / 2;
              const centerY = canvas.height / scale / 2;

              // Draw the layer centered
              ctx.drawImage(
                img,
                centerX - rect.width / 2,
                centerY - rect.height / 2,
                rect.width,
                rect.height
              );
              resolve();
            };
          });
        }

        if (Date.now() - startTime < duration) {
          requestAnimationFrame(draw);
        } else {
          mediaRecorder.stop();
        }
      }

      draw();

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const extension = selectedMimeType.includes("webm") ? "webm" : "mp4";
        const blob = new Blob(chunks, { type: selectedMimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `animation.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Remove loading state
        exportButton.classList.remove("loading");
      };
    });
  });

  // Handle layer toggle
  document.querySelectorAll(".layer-toggle").forEach((toggle) => {
    toggle.addEventListener("click", function () {
      const layer = this.dataset.layer;
      const isActive = this.classList.contains("active");
      const isSequential = document
        .querySelector(".mode-dot")
        .classList.contains("selected");

      // Toggle active class
      this.classList.toggle("active");

      // Update layer visibility
      const layerElement = document.getElementById(`layer${layer}`);
      layerElement.style.opacity = isActive ? "0" : "1";
      layerElement.style.pointerEvents = isActive ? "none" : "auto";

      // If in sequential mode, update all layers
      if (isSequential) {
        // First, ensure all visible layers have the sequential class
        layers.forEach((l) => {
          if (l.style.opacity !== "0") {
            l.classList.remove("simultaneous");
            l.classList.add("sequential");
          } else {
            // Remove sequential class from hidden layers
            l.classList.remove("sequential");
            l.classList.add("simultaneous");
          }
        });

        // Reset all layers' content to plain text first
        layers.forEach((l) => {
          if (l.style.opacity !== "0") {
            const text = l.textContent;
            l.innerHTML = text;
          }
        });

        // Then update the spans for visible layers
        updateLetterSpans();
      }
    });
  });

  // Set initial layer states
  document.querySelectorAll(".layer-toggle").forEach((toggle) => {
    const layer = toggle.dataset.layer;
    const layerElement = document.getElementById(`layer${layer}`);
    if (layerElement.style.opacity !== "0") {
      toggle.classList.add("active");
    }
  });

  // Handle state value clicks
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("state-value")) {
      const layer = e.target.dataset.layer;
      const setting = e.target.dataset.setting;
      const currentState = parseFloat(e.target.dataset.state);

      // Cycle through states: 0.25 -> 0.5 -> 1 -> 1.5 -> 2 -> 0.25
      const states = [0.25, 0.5, 1, 1.5, 2];
      const currentIndex = states.indexOf(currentState);
      const nextIndex = (currentIndex + 1) % states.length;
      const nextState = states[nextIndex];

      // Update the state and text
      e.target.dataset.state = nextState;
      const displayValue = nextState === 0.25 ? "0.2" : nextState.toFixed(1);
      e.target.textContent = displayValue;

      // Update animation duration
      const layerElement = document.getElementById(`layer${layer}`);
      const baseDuration = 3; // Base duration in seconds

      if (setting === "weight") {
        layerElement.style.setProperty(
          "--weight-duration",
          `${baseDuration / nextState}s`
        );
      } else if (setting === "width") {
        layerElement.style.setProperty(
          "--width-duration",
          `${baseDuration / nextState}s`
        );
      }

      // Update spans if in sequential mode
      if (layerElement.classList.contains("sequential")) {
        const spans = layerElement.querySelectorAll("span");
        spans.forEach((span) => {
          if (setting === "weight") {
            span.style.setProperty(
              "--weight-duration",
              `${baseDuration / nextState}s`
            );
          } else if (setting === "width") {
            span.style.setProperty(
              "--width-duration",
              `${baseDuration / nextState}s`
            );
          }
        });
      }
    }
  });

  // Color toggle functionality
  document
    .querySelector(".color-toggle .color-dot")
    .addEventListener("click", function () {
      this.classList.toggle("selected");
      const isColorAnimation = this.classList.contains("selected");

      // Get the current colors from each layer
      const layer1Color = document.querySelector(
        '.color-dot-wrapper[data-layer="1"] .color-dot'
      ).style.background;
      const layer2Color = document.querySelector(
        '.color-dot-wrapper[data-layer="2"] .color-dot'
      ).style.background;
      const layer3Color = document.querySelector(
        '.color-dot-wrapper[data-layer="3"] .color-dot'
      ).style.background;

      // Set CSS variables for the colors
      document.documentElement.style.setProperty(
        "--layer-1-color",
        layer1Color
      );
      document.documentElement.style.setProperty(
        "--layer-2-color",
        layer2Color
      );
      document.documentElement.style.setProperty(
        "--layer-3-color",
        layer3Color
      );

      // Toggle color animation class on all layers
      document.querySelectorAll(".text-layer").forEach((layer) => {
        if (isColorAnimation) {
          layer.classList.add("color-animation");
        } else {
          layer.classList.remove("color-animation");
        }
      });
    });

  // Function to generate random color
  function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Function to randomize background color
  function randomizeBackground() {
    const color = getRandomColor();
    const bgColorPicker = document.querySelector(
      '.color-dot-wrapper[data-layer="bg"] .color-picker'
    );
    const bgColorDot = document.querySelector(
      '.color-dot-wrapper[data-layer="bg"] .color-dot'
    );

    document.body.style.backgroundColor = color;
    bgColorPicker.value = color;
    bgColorDot.style.background = color;
  }

  // Function to randomize all settings
  function randomizeAllSettings() {
    // Randomize colors
    updateLayerColors();
    randomizeBackground();

    // Randomize speeds
    const states = [0.25, 0.5, 1, 1.5, 2];
    document.querySelectorAll(".state-value").forEach((value) => {
      const randomState = states[Math.floor(Math.random() * states.length)];
      value.dataset.state = randomState;
      value.textContent = randomState === 0.25 ? "0.2" : randomState.toFixed(1);

      // Update animation duration
      const layer = value.dataset.layer;
      const setting = value.dataset.setting;
      const layerElement = document.getElementById(`layer${layer}`);
      const baseDuration = 3;

      if (setting === "weight") {
        layerElement.style.setProperty(
          "--weight-duration",
          `${baseDuration / randomState}s`
        );
      } else if (setting === "width") {
        layerElement.style.setProperty(
          "--width-duration",
          `${baseDuration / randomState}s`
        );
      }
    });

    // Randomize toggles
    const toggles = [
      document.querySelector(".mode-dot"),
      document.querySelector(".curve-dot"),
      document.querySelector(".multiply-dot"),
      document.querySelector(".color-dot"),
      document.querySelector(".shadow-dot"),
    ];

    toggles.forEach((toggle) => {
      if (Math.random() > 0.5) {
        toggle.classList.add("selected");
      } else {
        toggle.classList.remove("selected");
      }
    });

    // Update UI based on toggles
    const isSequential = document
      .querySelector(".mode-dot")
      .classList.contains("selected");
    const isExp = document
      .querySelector(".curve-dot")
      .classList.contains("selected");
    const isMultiply = document
      .querySelector(".multiply-dot")
      .classList.contains("selected");
    const isColorAnimation = document
      .querySelector(".color-dot")
      .classList.contains("selected");
    const isShadow = document
      .querySelector(".shadow-dot")
      .classList.contains("selected");

    // Apply toggle states
    layers.forEach((layer) => {
      layer.classList.remove("simultaneous", "sequential");
      layer.classList.add(isSequential ? "sequential" : "simultaneous");
      layer.style.animationTimingFunction = isExp
        ? "cubic-bezier(0.95, 0.05, 0.795, 0.035)"
        : "ease-in-out";
      layer.style.mixBlendMode = isMultiply ? "multiply" : "normal";
      layer.style.textShadow = isShadow
        ? "1px 1px 2px rgba(0, 0, 0, 0.2)"
        : "none";
      if (isColorAnimation) {
        layer.classList.add("color-animation");
      } else {
        layer.classList.remove("color-animation");
      }
    });

    if (isSequential) {
      updateLetterSpans();
    }
  }

  // Function to toggle image mode
  function toggleImageMode() {
    isImageMode = !isImageMode;

    // Toggle image UI and canvas visibility
    document
      .querySelector(".image-controls")
      .classList.toggle("active", isImageMode);
    document
      .querySelector(".image-upload-row")
      .classList.toggle("active", isImageMode);
    document
      .querySelector(".image-pick-colors-row")
      .classList.toggle("active", isImageMode);
    document
      .querySelector(".image-blur-row")
      .classList.toggle("active", isImageMode);
    canvasContainer.classList.toggle("active", isImageMode);

    // Toggle text container size and constraints
    textContainer.classList.toggle("image-mode", isImageMode);

    if (isImageMode) {
      // Get canvas container dimensions
      const canvasWidth = canvasContainer.offsetWidth;
      const canvasHeight = canvasContainer.offsetHeight;

      // Set text container dimensions to match canvas container
      textContainer.style.width = `${canvasWidth}px`;
      textContainer.style.height = `${canvasHeight}px`;
      textContainer.style.maxWidth = `${canvasWidth}px`;
      textContainer.style.maxHeight = `${canvasHeight}px`;
      textContainer.style.overflow = "hidden";
      textContainer.style.wordWrap = "break-word";

      // Set smaller size when entering image mode
      layers.forEach((layer) => {
        layer.style.fontSize = "100px";
        layer.style.width = `${canvasWidth}px`;
        layer.style.maxWidth = `${canvasWidth}px`;
        layer.style.overflow = "hidden";
        layer.style.wordWrap = "break-word";
      });
    } else {
      // Reset text container constraints when exiting image mode
      textContainer.style.width = "";
      textContainer.style.height = "";
      textContainer.style.maxWidth = "";
      textContainer.style.maxHeight = "";
      textContainer.style.overflow = "";
      textContainer.style.wordWrap = "";

      // Reset to default size and remove constraints
      layers.forEach((layer) => {
        layer.style.fontSize = "250px";
        layer.style.width = "";
        layer.style.maxWidth = "";
        layer.style.overflow = "";
        layer.style.wordWrap = "";
      });
    }
  }

  // Function to toggle fullscreen
  function toggleFullscreen() {
    const controls = document.querySelector(".controls");
    const textContainer = document.querySelector(".text-container");

    // Only move text if we're not in image mode
    if (!isImageMode) {
      controls.classList.toggle("hidden");
      textContainer.style.transform = controls.classList.contains("hidden")
        ? "translateY(-80px)"
        : "translateY(0)";
    }
  }

  // Add hotkey listeners
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isTyping) {
        document.activeElement.blur();
      } else if (isImageMode) {
        toggleImageMode();
      }
      return;
    }

    if (isTyping) return;

    switch (e.key.toLowerCase()) {
      case "r":
        updateLayerColors();
        break;
      case "t":
        randomizeBackground();
        break;
      case "z":
        randomizeAllSettings();
        break;
      case "f":
        toggleFullscreen();
        break;
      case "i":
        toggleImageMode();
        break;
      case "1":
      case "2":
      case "3":
        const layerNum = e.key;
        const layerToggle = document.querySelector(
          `.layer-toggle[data-layer="${layerNum}"]`
        );
        if (layerToggle) {
          layerToggle.click();
        }
        break;
    }
  });

  // Track if user is typing
  let isTyping = false;

  // Add event listeners for typing state
  document.querySelectorAll(".text-layer").forEach((layer) => {
    layer.addEventListener("focus", () => {
      isTyping = true;
    });

    layer.addEventListener("blur", () => {
      isTyping = false;
    });
  });

  // Function to update layer colors
  function updateLayerColors() {
    const layers = [1, 2, 3];
    layers.forEach((layerNum) => {
      const color = getRandomColor();
      const layerElement = document.getElementById(`layer${layerNum}`);
      const colorDot = document.querySelector(
        `.color-dot-wrapper[data-layer="${layerNum}"] .color-dot`
      );
      const colorPicker = document.querySelector(
        `.color-dot-wrapper[data-layer="${layerNum}"] .color-picker`
      );

      layerElement.style.color = color;
      colorDot.style.background = color;
      colorPicker.value = color;

      // Update CSS variables if color animation is active
      if (document.querySelector(".color-dot").classList.contains("selected")) {
        document.documentElement.style.setProperty(
          `--layer-${layerNum}-color`,
          color
        );
      }
    });
  }

  // Image handling
  const imageUploadRow = document.querySelector(".image-upload-row");
  const imageEffectsRow = document.querySelector(".image-effects-row");
  const uploadButton = document.querySelector(".upload-button");
  const imageUpload = document.getElementById("imageUpload");
  const canvas = document.getElementById("imageCanvas");
  const canvasContainer = document.querySelector(".canvas-container");
  const ctx = canvas.getContext("2d");
  const textContainer = document.querySelector(".text-container");
  let originalImage = null;
  let isImageMode = false;

  // Set canvas size
  canvas.width = 1080;
  canvas.height = 1080;

  // Draw image with blur effect
  function drawImage() {
    if (!originalImage) return;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaled dimensions to fill canvas with significant extra zoom
    const scaleX = (canvas.width * 1.5) / originalImage.width; // 50% extra zoom
    const scaleY = (canvas.height * 1.5) / originalImage.height; // 50% extra zoom
    const scale = Math.max(scaleX, scaleY);

    const scaledWidth = originalImage.width * scale;
    const scaledHeight = originalImage.height * scale;

    // Calculate center position
    const centerX = (canvas.width - scaledWidth) / 2;
    const centerY = (canvas.height - scaledHeight) / 2;

    // Apply offset from dragging
    const x = centerX + imageOffsetX;
    const y = centerY + imageOffsetY;

    // Get blur amount
    const blurSlider = document.getElementById("blurAmount");
    const blurAmount = blurSlider ? parseFloat(blurSlider.value) : 0;

    // Apply blur effect using CSS filter
    canvas.style.filter = `blur(${blurAmount}px)`;

    // Draw image
    ctx.drawImage(originalImage, x, y, scaledWidth, scaledHeight);
  }

  // Load default image
  const defaultImage = new Image();
  defaultImage.onload = () => {
    originalImage = defaultImage;
    drawImage();
  };
  defaultImage.src = "KMB_kirchner_alpaufzug_website.webp";

  let imageOffsetX = 0;
  let imageOffsetY = 0;
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;

  // Handle mouse events for dragging
  canvas.addEventListener("mousedown", (e) => {
    if (!originalImage) return;
    isDragging = true;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!isDragging || !originalImage) return;

    const deltaX = e.clientX - lastMouseX;
    const deltaY = e.clientY - lastMouseY;

    imageOffsetX += deltaX;
    imageOffsetY += deltaY;

    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    drawImage();
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
  });

  canvas.addEventListener("mouseleave", () => {
    isDragging = false;
  });

  // Image mode text size control
  const imageTextSizeInput = document.getElementById("imageTextSizeInput");
  if (imageTextSizeInput) {
    imageTextSizeInput.addEventListener("input", () => {
      const size = imageTextSizeInput.value;
      layers.forEach((layer) => {
        layer.style.fontSize = `${size}px`;
      });
    });
  }

  // Handle image upload
  imageUpload.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          originalImage = img;
          drawImage();
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  });

  // Add blur amount slider event listener
  const blurSlider = document.getElementById("blurAmount");
  if (blurSlider) {
    blurSlider.addEventListener("input", () => {
      drawImage();
    });
  }

  // Function to get random color from image
  function getRandomColorFromImage() {
    if (!originalImage) return null;

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    // Scale image to fill canvas
    const scaleX = canvas.width / originalImage.width;
    const scaleY = canvas.height / originalImage.height;
    const scale = Math.max(scaleX, scaleY);
    const width = originalImage.width * scale;
    const height = originalImage.height * scale;
    const offsetX = (canvas.width - width) / 2 + imageOffsetX;
    const offsetY = (canvas.height - height) / 2 + imageOffsetY;

    tempCanvas.width = width;
    tempCanvas.height = height;
    tempCtx.drawImage(originalImage, 0, 0, width, height);

    // Get random coordinates within the visible image area
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);

    // Get color at coordinates
    const imageData = tempCtx.getImageData(x, y, 1, 1);
    const data = imageData.data;
    return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
  }

  // Function to convert RGB to hex
  function rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return "#000000";

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Add click handler for Pick Colors button
  document
    .querySelector(".pick-colors-button")
    .addEventListener("click", () => {
      if (!originalImage) return;

      // Get three random colors from the image
      const colors = Array(3)
        .fill()
        .map(() => getRandomColorFromImage());

      // Update layer colors
      colors.forEach((color, index) => {
        const layerNum = index + 1;
        const layerElement = document.getElementById(`layer${layerNum}`);
        const colorDot = document.querySelector(
          `.color-dot-wrapper[data-layer="${layerNum}"] .color-dot`
        );
        const colorPicker = document.querySelector(
          `.color-dot-wrapper[data-layer="${layerNum}"] .color-picker`
        );

        layerElement.style.color = color;
        colorDot.style.background = color;
        colorPicker.value = rgbToHex(color);

        // Update CSS variables if color animation is active
        if (
          document.querySelector(".color-dot").classList.contains("selected")
        ) {
          document.documentElement.style.setProperty(
            `--layer-${layerNum}-color`,
            color
          );
        }
      });
    });

  // Upload button click
  uploadButton.addEventListener("click", () => {
    imageUpload.click();
  });
});
