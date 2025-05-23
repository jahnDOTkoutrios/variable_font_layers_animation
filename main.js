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

      // Update other layers first
      layers.forEach((l) => {
        if (l !== layer) {
          l.textContent = text;
        }
      });

      // Update spans if in sequential mode
      if (layer.classList.contains("sequential")) {
        // Store the current animation properties
        const layerSpeed = parseFloat(layer.style.animationDuration) || 3;
        const layerTiming = layer.style.animationTimingFunction;

        // Clear and rebuild the content
        layer.innerHTML = "";

        // Create spans for each character
        for (let i = 0; i < text.length; i++) {
          const span = document.createElement("span");
          span.textContent = text[i];
          span.style.animationDuration = `${layerSpeed}s`;
          span.style.animationDelay = `${i * 0.3}s`;
          span.style.animationTimingFunction = layerTiming;
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
      if (layer.classList.contains("sequential")) {
        const text = layer.innerHTML;
        const layerSpeed = parseFloat(layer.style.animationDuration) || 3;
        const layerTiming = layer.style.animationTimingFunction;

        // Create a temporary container to hold the text
        const temp = document.createElement("div");
        temp.innerHTML = text;

        // Process each text node
        const processNode = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const spans = [];
            for (let i = 0; i < text.length; i++) {
              const span = document.createElement("span");
              span.textContent = text[i];
              span.style.animationDuration = `${layerSpeed}s`;
              span.style.animationDelay = `${i * 0.3}s`;
              span.style.animationTimingFunction = layerTiming;
              spans.push(span);
            }
            return spans;
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            const newElement = document.createElement(node.tagName);
            // Copy all attributes from the original element
            Array.from(node.attributes).forEach((attr) => {
              newElement.setAttribute(attr.name, attr.value);
            });
            // Process child nodes
            Array.from(node.childNodes).forEach((child) => {
              const processed = processNode(child);
              if (Array.isArray(processed)) {
                processed.forEach((span) => newElement.appendChild(span));
              } else {
                newElement.appendChild(processed);
              }
            });
            return newElement;
          }
          return node;
        };

        // Process all nodes
        const processed = Array.from(temp.childNodes).map(processNode);

        // Clear and append all processed nodes
        layer.innerHTML = "";
        processed.forEach((node) => {
          if (Array.isArray(node)) {
            node.forEach((span) => layer.appendChild(span));
          } else {
            layer.appendChild(node);
          }
        });
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

      // Set canvas size with higher resolution
      const scale = 2; // Scale factor for higher resolution
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;

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
      let frameCount = 0;

      function draw() {
        // Clear canvas
        ctx.fillStyle = getComputedStyle(document.body).backgroundColor;
        ctx.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

        // Calculate center coordinates
        const centerX = canvas.width / scale / 2;
        const centerY = canvas.height / scale / 2;

        // Draw text layers
        layers.forEach((layer) => {
          const fontSize = parseInt(layer.style.fontSize);
          const currentTime = (Date.now() - startTime) / 1000;
          const layerDelay = parseFloat(layer.style.animationDelay) || 0;
          const layerSpeed = parseFloat(layer.style.animationDuration) || 3;

          // Get the computed style of the layer
          const layerStyle = window.getComputedStyle(layer);
          const lineHeight = parseFloat(layerStyle.lineHeight);

          if (layer.classList.contains("sequential")) {
            // For sequential mode, draw each span separately
            const spans = layer.querySelectorAll("span");
            let currentLine = 0;
            let xOffset = 0;
            let maxLineWidth = 0;
            let lineWidths = [];
            let lineSpans = [];

            // First pass: calculate line widths and group spans by line
            spans.forEach((span, index) => {
              if (span.textContent === "\n") {
                lineWidths.push(xOffset);
                maxLineWidth = Math.max(maxLineWidth, xOffset);
                xOffset = 0;
                currentLine++;
                lineSpans[currentLine] = [];
              } else {
                if (!lineSpans[currentLine]) lineSpans[currentLine] = [];
                lineSpans[currentLine].push(span);
                xOffset += ctx.measureText(span.textContent).width;
              }
            });
            lineWidths.push(xOffset);
            maxLineWidth = Math.max(maxLineWidth, xOffset);

            // Second pass: draw each line
            const totalHeight = lineSpans.length * lineHeight;
            let yOffset = centerY - totalHeight / 2 + lineHeight / 2;

            lineSpans.forEach((line, lineIndex) => {
              if (line.length === 0) {
                yOffset += lineHeight;
                return;
              }
              xOffset = 0;
              line.forEach((span) => {
                const spanDelay = parseFloat(span.style.animationDelay) || 0;
                const spanTime = (currentTime - spanDelay) % layerSpeed;
                const progress = spanTime / layerSpeed;
                const weight = 101 + 99 * Math.sin(progress * Math.PI);

                ctx.font = `${fontSize}px Offgrid`;
                ctx.fillStyle = layer.style.color;
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.fontVariationSettings = `"wght" ${weight}`;

                const textWidth = ctx.measureText(span.textContent).width;
                ctx.fillText(
                  span.textContent,
                  centerX - lineWidths[lineIndex] / 2 + xOffset,
                  yOffset
                );
                xOffset += textWidth;
              });
              yOffset += lineHeight;
            });
          } else {
            // For simultaneous mode
            const time = (currentTime - layerDelay) % layerSpeed;
            const progress = time / layerSpeed;
            const weight = 101 + 99 * Math.sin(progress * Math.PI);

            ctx.font = `${fontSize}px Offgrid`;
            ctx.fillStyle = layer.style.color;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fontVariationSettings = `"wght" ${weight}`;

            // Handle line breaks in simultaneous mode
            const lines = layer.textContent.split("\n");
            const totalHeight = lines.length * lineHeight;
            let yOffset = centerY - totalHeight / 2 + lineHeight / 2;

            lines.forEach((line) => {
              if (line.trim() === "") {
                yOffset += lineHeight;
                return;
              }
              ctx.fillText(line, centerX, yOffset);
              yOffset += lineHeight;
            });
          }
        });

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

      // Toggle active class
      this.classList.toggle("active");

      // Update layer visibility
      const layerElement = document.getElementById(`layer${layer}`);
      layerElement.style.opacity = isActive ? "0" : "1";
      layerElement.style.pointerEvents = isActive ? "none" : "auto";
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

  // Function to toggle fullscreen
  function toggleFullscreen() {
    const controls = document.querySelector(".controls");
    controls.classList.toggle("hidden");
  }

  // Add hotkey listeners
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isTyping) {
      document.activeElement.blur();
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
});
