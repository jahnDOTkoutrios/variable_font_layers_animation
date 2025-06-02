document.addEventListener("DOMContentLoaded", () => {
  // Function to convert RGB to HSB
  function rgbToHsb(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    let s = max === 0 ? 0 : delta / max;
    let v = max;

    if (delta !== 0) {
      if (max === r) {
        h = ((g - b) / delta) % 6;
      } else if (max === g) {
        h = (b - r) / delta + 2;
      } else {
        h = (r - g) / delta + 4;
      }

      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }

    return {
      h: Math.round(h),
      s: Math.round(s * 100),
      b: Math.round(v * 100),
    };
  }

  // Function to convert HSB to RGB
  function hsbToRgb(h, s, b) {
    h = h % 360;
    s = s / 100;
    b = b / 100;

    const k = (n) => (n + h / 60) % 6;
    const f = (n) => b * (1 - s * Math.max(0, Math.min(k(n), 4 - k(n), 1)));

    return {
      r: Math.round(f(5) * 255),
      g: Math.round(f(3) * 255),
      b: Math.round(f(1) * 255),
    };
  }

  const layers = [
    document.getElementById("layer1"),
    document.getElementById("layer2"),
    document.getElementById("layer3"),
  ];

  // Set default text for all layers
  const defaultText = "The Quick\nBrown Fox\nJumps Over the\nLazy Dog.";
  layers.forEach((layer) => {
    layer.textContent = defaultText;
  });

  // Randomize initial colors
  layers.forEach((layer, index) => {
    const color = getRandomColor();
    layer.style.color = color;

    // Update the color dot
    const colorDot = document.querySelector(
      `.color-dot-wrapper[data-layer="${index + 1}"] .color-dot`
    );
    if (colorDot) {
      colorDot.style.background = color;

      // Update HSB sliders
      const hsbSliders = document.querySelectorAll(
        `.color-dot-wrapper[data-layer="${index + 1}"] .hsb-slider`
      );
      if (hsbSliders.length === 3) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const hsb = rgbToHsb(r, g, b);
        hsbSliders[0].value = hsb.h;
        hsbSliders[1].value = hsb.s;
        hsbSliders[2].value = hsb.b;
      }
    }
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
  let originalSize = 200; // Store the original size

  textSizeInput.addEventListener("input", (e) => {
    const size = e.target.value;
    originalSize = parseInt(size); // Update original size when slider changes
    textSizeValue.textContent = `${size} px`;
    layers.forEach((layer) => {
      layer.style.fontSize = `${size}px`;
      // Ensure layer width matches container width
      layer.style.width = "100%";
      layer.style.maxWidth = "100%";
    });
  });

  // Set initial size
  layers.forEach((layer) => {
    layer.style.fontSize = "200px";
    layer.style.width = "100%";
    layer.style.maxWidth = "100%";
  });

  // Handle color picker changes
  document.querySelectorAll(".color-dot-wrapper").forEach((wrapper) => {
    const layer = wrapper.dataset.layer;
    const dot = wrapper.querySelector(".color-dot");
    const hsbSliders = wrapper.querySelectorAll(".hsb-slider");
    const pickerContainer = wrapper.querySelector(".color-picker-container");

    if (!dot || !pickerContainer || !hsbSliders || hsbSliders.length !== 3)
      return;

    let closeTimeout;
    let isPickerActive = false;

    // Function to close all color pickers
    function closeAllPickers() {
      document
        .querySelectorAll(".color-picker-container")
        .forEach((container) => {
          container.classList.remove("active");
        });
      isPickerActive = false;
    }

    // Toggle color picker on dot click
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      const isActive = pickerContainer.classList.contains("active");
      closeAllPickers();
      if (!isActive) {
        pickerContainer.classList.add("active");
        isPickerActive = true;
      }
    });

    // Close color picker when clicking outside
    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        closeAllPickers();
      }
    });

    // Handle mouse movement around the picker
    wrapper.addEventListener("mouseleave", (e) => {
      if (!isPickerActive) return; // Don't close if picker is active

      // Get the position of the mouse relative to the wrapper
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Only close if mouse is far enough away
      if (x < -50 || x > rect.width + 50 || y > rect.height + 100) {
        closeTimeout = setTimeout(() => {
          if (!isPickerActive) {
            pickerContainer.classList.remove("active");
          }
        }, 100);
      }
    });

    wrapper.addEventListener("mouseenter", () => {
      if (closeTimeout) {
        clearTimeout(closeTimeout);
      }
    });

    // Prevent closing when clicking inside the picker
    pickerContainer.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    // Keep picker open when interacting with sliders
    hsbSliders.forEach((slider) => {
      slider.addEventListener("mousedown", () => {
        isPickerActive = true;
      });
      slider.addEventListener("mouseup", () => {
        isPickerActive = true;
      });
    });

    // Initialize HSB values from initial color
    const initialColor = dot.style.background;
    if (initialColor) {
      let rgb;
      if (initialColor.startsWith("rgb")) {
        rgb = initialColor.match(/\d+/g);
      } else if (initialColor.startsWith("#")) {
        // Convert hex to RGB
        const hex = initialColor.slice(1);
        rgb = [
          parseInt(hex.slice(0, 2), 16),
          parseInt(hex.slice(2, 4), 16),
          parseInt(hex.slice(4, 6), 16),
        ];
      }

      if (rgb && rgb.length === 3) {
        const hsb = rgbToHsb(
          parseInt(rgb[0]),
          parseInt(rgb[1]),
          parseInt(rgb[2])
        );
        if (hsbSliders[0] && hsbSliders[1] && hsbSliders[2]) {
          hsbSliders[0].value = hsb.h;
          hsbSliders[1].value = hsb.s;
          hsbSliders[2].value = hsb.b;
        }
      }
    }

    // Function to update color from HSB values
    function updateColorFromHSB() {
      if (!hsbSliders[0] || !hsbSliders[1] || !hsbSliders[2]) return;

      const h = parseInt(hsbSliders[0].value) || 0;
      const s = parseInt(hsbSliders[1].value) || 0;
      const b = parseInt(hsbSliders[2].value) || 0;

      const rgb = hsbToRgb(h, s, b);
      const color = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      const hexColor = rgbToHex(color).toUpperCase();

      // Update dot color
      dot.style.background = hexColor;

      // Update layer color or background
      if (layer === "bg") {
        document.body.style.backgroundColor = hexColor;
        // Redraw the image if we're in image mode
        if (isImageMode && originalImage) {
          drawImage();
        }
      } else {
        const layerElement = document.getElementById(`layer${layer}`);
        if (layerElement) {
          layerElement.style.color = hexColor;
        }
      }

      // Update CSS variable if color animation is active
      if (document.querySelector(".color-dot").classList.contains("selected")) {
        document.documentElement.style.setProperty(
          `--layer-${layer}-color`,
          hexColor
        );
      }
    }

    // Handle HSB slider changes
    hsbSliders.forEach((slider) => {
      slider.addEventListener("input", () => {
        updateColorFromHSB();
      });
    });

    // Close color picker when pressing Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllPickers();
      }
    });
  });

  // Function to convert RGB to hex
  function rgbToHex(rgb) {
    const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!match) return "#000000";

    const r = parseInt(match[1]);
    const g = parseInt(match[2]);
    const b = parseInt(match[3]);

    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  // Set initial background color
  const bgColorDot = document.querySelector(
    '.color-dot-wrapper[data-layer="bg"] .color-dot'
  );
  if (bgColorDot) {
    const initialBgColor = bgColorDot.style.background;
    if (initialBgColor) {
      document.body.style.backgroundColor = initialBgColor;
    }
  }

  // Handle text input and update all layers
  layers.forEach((layer) => {
    layer.addEventListener("input", (e) => {
      // Only process input in normal mode
      if (layer.classList.contains("sequential")) {
        return;
      }

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
            updateLetterSpans();
          }
        }
      });

      // Update spans for the active layer if in sequential mode
      if (layer.classList.contains("sequential")) {
        updateLetterSpans();
      }
    });

    // Handle paste events to preserve formatting
    layer.addEventListener("paste", (e) => {
      // Only process paste in normal mode
      if (layer.classList.contains("sequential")) {
        e.preventDefault();
        return;
      }
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    });

    // Handle keydown events to ensure consistent line break handling
    layer.addEventListener("keydown", (e) => {
      // Only process keydown in normal mode
      if (layer.classList.contains("sequential")) {
        e.preventDefault();
        return;
      }
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

        // If in sequential mode, update all spans
        if (layer.classList.contains("sequential")) {
          const spans = layer.querySelectorAll("span");
          spans.forEach((span) => {
            span.style.animationTimingFunction = isExp
              ? "cubic-bezier(0.95, 0.05, 0.795, 0.035)"
              : "ease-in-out";
          });
        }
      });
    }
  });

  // Handle mode selection
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("mode-dot")) {
      // Toggle selected class
      e.target.classList.toggle("selected");
      const isSequential = e.target.classList.contains("selected");

      // Store current text content
      const baseText = layers[0].textContent;

      // Update animation mode for all layers
      layers.forEach((layer) => {
        // Remove both mode classes
        layer.classList.remove("simultaneous", "sequential");

        // Add the new mode class
        layer.classList.add(isSequential ? "sequential" : "simultaneous");

        // Handle the text content based on mode
        if (isSequential) {
          // For sequential mode, we'll let updateLetterSpans handle the content
          layer.textContent = baseText;
          // Disable cursor and make content uneditable in sequence mode
          layer.style.cursor = "default";
          layer.contentEditable = "false";
          // Remove any existing selection
          window.getSelection().removeAllRanges();
          // Preserve text alignment
          const currentAlignment = layer.style.textAlign || "center";
          layer.style.textAlign = currentAlignment;
        } else {
          // For simultaneous mode, ensure we have clean text without spans
          layer.textContent = baseText;
          // Enable cursor and make content editable in normal mode
          layer.style.cursor = "text";
          layer.contentEditable = "true";
          // Remove any existing selection
          window.getSelection().removeAllRanges();
          // Preserve text alignment
          const currentAlignment = layer.style.textAlign || "center";
          layer.style.textAlign = currentAlignment;
        }
      });

      // If switching to sequential mode, update all layers
      if (isSequential) {
        updateLetterSpans();
      }
    }
  });

  // Function to wrap each letter in a span
  function updateLetterSpans() {
    // First, get the maximum height needed across all layers
    let maxHeight = 0;
    const baseText = layers[0].textContent; // Use first layer as base

    // Get the width from the first visible layer
    const baseLayer = layers.find((layer) => layer.style.opacity !== "0");
    const baseWidth = baseLayer ? baseLayer.offsetWidth : window.innerWidth;

    // Ensure all layers have the same text content and calculate max height
    layers.forEach((layer) => {
      if (layer.style.opacity !== "0") {
        // First set the text content to ensure proper height calculation
        layer.textContent = baseText;

        // Create a temporary div to measure the exact height needed
        const tempDiv = document.createElement("div");
        tempDiv.style.cssText = window.getComputedStyle(layer).cssText;
        tempDiv.style.position = "absolute";
        tempDiv.style.visibility = "hidden";
        tempDiv.style.width = "100%";
        tempDiv.style.maxWidth = "100%";
        tempDiv.style.height = "auto";
        tempDiv.style.whiteSpace = "pre-wrap";
        tempDiv.style.wordWrap = "normal";
        tempDiv.style.overflowWrap = "normal";
        tempDiv.style.webkitNbspMode = "normal";
        tempDiv.style.textAlign = layer.style.textAlign || "center";
        tempDiv.style.lineHeight = layer.style.lineHeight || "0.75";
        tempDiv.style.fontSize = getComputedStyle(layer).fontSize;
        tempDiv.style.fontFamily = getComputedStyle(layer).fontFamily;
        tempDiv.style.padding = layer.style.padding || "0";
        tempDiv.style.margin = getComputedStyle(layer).margin;
        tempDiv.textContent = baseText;
        document.body.appendChild(tempDiv);
        maxHeight = Math.max(maxHeight, tempDiv.offsetHeight);
        document.body.removeChild(tempDiv);
      }
    });

    // Then update all layers with the same height and content
    layers.forEach((layer) => {
      // Only process visible layers that are in sequential mode
      if (
        layer.classList.contains("sequential") &&
        layer.style.opacity !== "0"
      ) {
        const text = baseText; // Use the same base text for all layers
        const weightDuration =
          layer.style.getPropertyValue("--weight-duration") || "3s";
        const widthDuration =
          layer.style.getPropertyValue("--width-duration") || "3s";
        const layerTiming = layer.style.animationTimingFunction;
        const currentAlignment = layer.style.textAlign || "center";
        const currentLineHeight = layer.style.lineHeight || "0.75";
        const currentPadding = layer.style.padding || "0";
        const currentTransform =
          layer.style.transform || "translate(-50%, -45%)";

        // Clear the layer content
        layer.innerHTML = "";

        // Set the layer width to match the container width
        layer.style.width = "100%";
        layer.style.maxWidth = "100%";
        layer.style.textAlign = currentAlignment;
        layer.style.lineHeight = currentLineHeight;
        layer.style.padding = currentPadding;
        layer.style.transform = currentTransform;

        // Create a single container for all text
        const textContainer = document.createElement("div");
        textContainer.style.display = "block";
        textContainer.style.textAlign = currentAlignment;
        textContainer.style.width = "100%";
        textContainer.style.maxWidth = "100%";
        textContainer.style.whiteSpace = "pre-wrap";
        textContainer.style.wordWrap = "normal";
        textContainer.style.overflowWrap = "normal";
        textContainer.style.webkitNbspMode = "normal";
        textContainer.style.lineHeight = currentLineHeight;
        textContainer.style.padding = "0";
        textContainer.style.margin = "0";

        // Process each character in the text, preserving line breaks
        let charIndex = 0;
        for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (char === "\n") {
            // Add a line break
            textContainer.appendChild(document.createTextNode("\n"));
          } else {
            // Add a character span
            const span = document.createElement("span");
            span.textContent = char;
            span.style.display = "inline";
            span.style.whiteSpace = "pre-wrap";
            span.style.animationDuration = `${weightDuration}, ${widthDuration}`;
            span.style.animationDelay = `${charIndex * 0.3}s`;
            span.style.animationTimingFunction = layerTiming;
            span.style.setProperty("--weight-duration", weightDuration);
            span.style.setProperty("--width-duration", widthDuration);
            textContainer.appendChild(span);
            charIndex++;
          }
        }

        // Add the text container to the layer
        layer.appendChild(textContainer);

        // Set the height to accommodate all content
        layer.style.height = "auto";
        layer.style.minHeight = `${maxHeight}px`;
        layer.style.display = "flex";
        layer.style.flexDirection = "column";
        layer.style.justifyContent = "center";
        layer.style.alignItems = "center";
        layer.style.overflow = "visible"; // Ensure text is not cut off
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

  // Handle rounded mode toggle
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("rounded-dot")) {
      const isRounded = e.target.classList.contains("selected");

      // Toggle selected class
      e.target.classList.toggle("selected");

      if (isRounded) {
        // Switching back to regular font - restore previous states
        const layer2 = document.getElementById("layer2");
        const layer3 = document.getElementById("layer3");
        layer2.style.opacity = previousLayerStates.layer2.opacity;
        layer2.style.pointerEvents = previousLayerStates.layer2.pointerEvents;
        layer3.style.opacity = previousLayerStates.layer3.opacity;
        layer3.style.pointerEvents = previousLayerStates.layer3.pointerEvents;

        // Update layer toggles
        document
          .querySelector('.layer-toggle[data-layer="2"]')
          .classList.toggle(
            "active",
            previousLayerStates.layer2.opacity === "1"
          );
        document
          .querySelector('.layer-toggle[data-layer="3"]')
          .classList.toggle(
            "active",
            previousLayerStates.layer3.opacity === "1"
          );
      } else {
        // Switching to rounded font - store current states and hide layers 2 and 3
        const layer2 = document.getElementById("layer2");
        const layer3 = document.getElementById("layer3");

        // Store current states
        previousLayerStates.layer2 = {
          opacity: layer2.style.opacity,
          pointerEvents: layer2.style.pointerEvents,
        };
        previousLayerStates.layer3 = {
          opacity: layer3.style.opacity,
          pointerEvents: layer3.style.pointerEvents,
        };

        // Hide layers 2 and 3
        layer2.style.opacity = "0";
        layer2.style.pointerEvents = "none";
        layer3.style.opacity = "0";
        layer3.style.pointerEvents = "none";

        // Update layer toggles
        document
          .querySelector('.layer-toggle[data-layer="2"]')
          .classList.remove("active");
        document
          .querySelector('.layer-toggle[data-layer="3"]')
          .classList.remove("active");
      }

      // Switch the font
      layers.forEach((layer) => {
        layer.style.fontFamily = isRounded
          ? "Offgrid, sans-serif"
          : "OffgridRounded, sans-serif";
      });
    }
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
    const bgColorDot = document.querySelector(
      '.color-dot-wrapper[data-layer="bg"] .color-dot'
    );
    const hsbSliders = document.querySelectorAll(
      '.color-dot-wrapper[data-layer="bg"] .hsb-slider'
    );

    // Convert hex to RGB
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);

    // Convert RGB to HSB
    const hsb = rgbToHsb(r, g, b);

    // Update background color
    document.body.style.backgroundColor = color;
    bgColorDot.style.background = color;

    // Update HSB sliders
    hsbSliders[0].value = hsb.h;
    hsbSliders[1].value = hsb.s;
    hsbSliders[2].value = hsb.b;

    // Redraw the image if we're in image mode
    if (isImageMode && originalImage) {
      drawImage();
    }
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

    // Store current text content
    const baseText = layers[0].textContent;

    // Apply toggle states
    layers.forEach((layer) => {
      // Remove both mode classes
      layer.classList.remove("simultaneous", "sequential");

      // Add the new mode class
      layer.classList.add(isSequential ? "sequential" : "simultaneous");

      // Reset line height based on mode
      layer.style.lineHeight = "0.95";

      // Handle the text content based on mode
      if (isSequential) {
        // For sequential mode, we'll let updateLetterSpans handle the content
        layer.textContent = baseText;
        // Disable cursor and make content uneditable in sequence mode
        layer.style.cursor = "default";
        layer.contentEditable = "false";
        // Remove any existing selection
        window.getSelection().removeAllRanges();
        // Preserve text alignment
        const currentAlignment = layer.style.textAlign || "center";
        layer.style.textAlign = currentAlignment;
      } else {
        // For simultaneous mode, ensure we have clean text without spans
        layer.textContent = baseText;
        // Enable cursor and make content editable in normal mode
        layer.style.cursor = "text";
        layer.contentEditable = "true";
        // Remove any existing selection
        window.getSelection().removeAllRanges();
        // Preserve text alignment
        const currentAlignment = layer.style.textAlign || "center";
        layer.style.textAlign = currentAlignment;
      }

      // Apply other styles
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

  // Initialize canvas container
  canvasContainer.style.display = "none";

  // Add variables to store image mode settings
  let savedImageSettings = {
    zoom: 100,
    positionX: 0,
    positionY: 0,
    dotResolution: 10,
    dotSize: 80,
    pattern: "dots",
    imageOffsetX: 0,
    imageOffsetY: 0,
  };

  // Function to toggle image mode
  function toggleImageMode() {
    isImageMode = !isImageMode;

    // Always show controls when entering image mode
    if (isImageMode) {
      document.querySelector(".controls").classList.remove("hidden");
      document.querySelector(".text-container").style.transform =
        "translateY(0)";
    }

    // Toggle image UI and canvas visibility
    document
      .querySelector(".image-controls")
      .classList.toggle("active", isImageMode);
    document
      .querySelector(".image-upload-row")
      .classList.toggle("active", isImageMode);
    document
      .querySelector(".rasterization-controls")
      .classList.toggle("active", isImageMode);
    canvasContainer.style.display = isImageMode ? "block" : "none";

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
        layer.style.whiteSpace = "pre-wrap";
      });

      // Restore saved settings
      imageZoom = savedImageSettings.zoom;
      imageOffsetX = savedImageSettings.imageOffsetX;
      imageOffsetY = savedImageSettings.imageOffsetY;

      // Update UI controls with saved values
      document.getElementById("imageZoom").value = savedImageSettings.zoom;
      document.getElementById("imagePositionX").value =
        savedImageSettings.positionX;
      document.getElementById("imagePositionY").value =
        savedImageSettings.positionY;
      document.getElementById("dotResolution").value =
        savedImageSettings.dotResolution;
      document.getElementById("dotSize").value = savedImageSettings.dotSize;

      // Restore pattern selection
      document.querySelectorAll(".pattern-dot").forEach((dot) => {
        dot.classList.toggle(
          "selected",
          dot.dataset.pattern === savedImageSettings.pattern
        );
      });
      currentPattern = savedImageSettings.pattern;

      // Load default image if none is loaded
      if (!originalImage) {
        const defaultImage = new Image();
        if (defaultImage.src.startsWith("http")) {
          defaultImage.crossOrigin = "anonymous";
        }
        defaultImage.onload = () => {
          originalImage = defaultImage;
          drawImage();
        };
        defaultImage.onerror = (e) => {
          console.error("Error loading default image:", e);
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = 800;
          tempCanvas.height = 600;
          const tempCtx = tempCanvas.getContext("2d");
          const gradient = tempCtx.createLinearGradient(0, 0, 800, 600);
          gradient.addColorStop(0, "#ff6b6b");
          gradient.addColorStop(1, "#4ecdc4");
          tempCtx.fillStyle = gradient;
          tempCtx.fillRect(0, 0, 800, 600);
          tempCtx.fillStyle = "rgba(255, 255, 255, 0.2)";
          for (let i = 0; i < 50; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 600;
            const size = Math.random() * 100 + 50;
            tempCtx.beginPath();
            tempCtx.arc(x, y, size, 0, Math.PI * 2);
            tempCtx.fill();
          }
          const dataUrl = tempCanvas.toDataURL("image/png");
          defaultImage.src = dataUrl;
        };
        defaultImage.src = "bouncy-castle.jpg.webp";
      } else {
        drawImage();
      }
    } else {
      // Save current settings before exiting image mode
      savedImageSettings = {
        zoom: imageZoom,
        positionX: parseInt(document.getElementById("imagePositionX").value),
        positionY: parseInt(document.getElementById("imagePositionY").value),
        dotResolution: parseInt(document.getElementById("dotResolution").value),
        dotSize: parseInt(document.getElementById("dotSize").value),
        pattern: currentPattern,
        imageOffsetX: imageOffsetX,
        imageOffsetY: imageOffsetY,
      };

      // Reset text container constraints when exiting image mode
      textContainer.style.width = "";
      textContainer.style.height = "";
      textContainer.style.maxWidth = "";
      textContainer.style.maxHeight = "";
      textContainer.style.overflow = "";
      textContainer.style.wordWrap = "";

      // Reset to original size and remove constraints
      layers.forEach((layer) => {
        layer.style.fontSize = `${originalSize}px`;
        layer.style.width = "100%";
        layer.style.maxWidth = "100%";
        layer.style.overflow = "";
        layer.style.wordWrap = "";
        layer.style.whiteSpace = "pre-wrap";
        // Reset any transform that might have been applied
        layer.style.transform = "translate(-50%, -45%)";
      });
    }
  }

  let imageOffsetX = 0;
  let imageOffsetY = 0;
  let imageZoom = 100;
  let currentPattern = "dots";
  let isDragging = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  let recorder = null;
  let isRecording = false;

  // Draw image with rasterization effect
  function drawImage() {
    if (!originalImage) {
      console.log("No image loaded");
      return;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaled dimensions to fill canvas
    const scaleX = canvas.width / originalImage.width;
    const scaleY = canvas.height / originalImage.height;
    const scale = Math.max(scaleX, scaleY) * (imageZoom / 100);

    const scaledWidth = originalImage.width * scale;
    const scaledHeight = originalImage.height * scale;

    // Calculate center position
    const centerX = (canvas.width - scaledWidth) / 2;
    const centerY = (canvas.height - scaledHeight) / 2;

    // Apply offset from dragging and position controls
    const x =
      centerX +
      imageOffsetX +
      parseInt(document.getElementById("imagePositionX").value);
    const y =
      centerY +
      imageOffsetY +
      parseInt(document.getElementById("imagePositionY").value);

    // Get background color from the body
    const bgColor = getComputedStyle(document.body).backgroundColor;
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw the image directly first
    ctx.drawImage(originalImage, x, y, scaledWidth, scaledHeight);

    // Now apply the rasterization effect on top
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Clear the canvas again
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Get dot size from slider
    const dotResolutionSlider = document.getElementById("dotResolution");
    const dotSizeSlider = document.getElementById("dotSize");
    const spacing = parseInt(dotResolutionSlider.value) * 2; // Convert slider value to spacing
    const sizePercent = parseInt(dotSizeSlider.value) / 100; // Convert slider value to percentage
    const maxSize = spacing * sizePercent; // Maximum size relative to spacing
    const minSize = 1;

    // Draw rasterization pattern
    for (let i = 0; i < canvas.width; i += spacing) {
      for (let j = 0; j < canvas.height; j += spacing) {
        const idx = (j * canvas.width + i) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3]; // Get alpha value
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;

        const size = minSize + (maxSize - minSize) * (1 - brightness);

        if (size > minSize) {
          // Use the actual color from the image with its original alpha
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a / 255})`;

          switch (currentPattern) {
            case "dots":
              ctx.beginPath();
              ctx.arc(
                i + spacing / 2,
                j + spacing / 2,
                size / 2,
                0,
                Math.PI * 2
              );
              ctx.fill();
              break;
            case "squares":
              ctx.fillRect(
                i + (spacing - size) / 2,
                j + (spacing - size) / 2,
                size,
                size
              );
              break;
            case "lines":
              const lineWidth = size / 2;
              ctx.fillRect(
                i + (spacing - lineWidth) / 2,
                j + (spacing - size) / 2,
                lineWidth,
                size
              );
              break;
          }
        }
      }
    }
  }

  // Handle image upload
  imageUpload.addEventListener("change", (e) => {
    console.log("File input changed");
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        console.log("File read complete");
        const img = new Image();
        img.onload = () => {
          console.log("Image loaded:", img.width, "x", img.height);
          originalImage = img;
          // Reset image offset
          imageOffsetX = 0;
          imageOffsetY = 0;
          // Draw the image
          drawImage();
        };
        img.onerror = (error) => {
          console.error("Error loading image:", error);
        };
        img.src = event.target.result;
      };
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };
      reader.readAsDataURL(file);
    }
  });

  // Add dot size slider event listener
  const dotResolutionSlider = document.getElementById("dotResolution");
  const dotSizeSlider = document.getElementById("dotSize");
  if (dotResolutionSlider) {
    dotResolutionSlider.addEventListener("input", () => {
      drawImage();
    });
  }
  if (dotSizeSlider) {
    dotSizeSlider.addEventListener("input", () => {
      drawImage();
    });
  }

  // Handle text alignment in image mode
  document.querySelectorAll(".alignment-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      // Remove selected class from all dots
      document.querySelectorAll(".alignment-dot").forEach((d) => {
        d.classList.remove("selected");
      });
      // Add selected class to clicked dot
      dot.classList.add("selected");

      // Update text alignment for all layers
      const alignment = dot.dataset.align;
      layers.forEach((layer) => {
        layer.style.textAlign = alignment;
        // If in sequential mode, update the text container alignment
        if (layer.classList.contains("sequential")) {
          const textContainer = layer.querySelector("div");
          if (textContainer) {
            textContainer.style.textAlign = alignment;
          }
        }
      });
    });
  });

  // Handle text position in image mode
  const textOffsetX = document.getElementById("textOffsetX");
  const textOffsetY = document.getElementById("textOffsetY");

  function updateTextPosition() {
    const x = textOffsetX.value;
    const y = textOffsetY.value;

    layers.forEach((layer) => {
      layer.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    });
  }

  if (textOffsetX && textOffsetY) {
    textOffsetX.addEventListener("input", updateTextPosition);
    textOffsetY.addEventListener("input", updateTextPosition);
  }

  // Reset text position when exiting image mode
  function resetTextPosition() {
    layers.forEach((layer) => {
      layer.style.transform = "translate(-50%, -50%)";
    });
  }

  // Update toggleImageMode function to handle both text and image position
  const originalToggleImageMode = toggleImageMode;
  toggleImageMode = function () {
    originalToggleImageMode();
    if (!isImageMode) {
      resetTextPosition();
      resetImagePosition();
    }
  };

  // Function to update layer colors
  function updateLayerColors() {
    const layers = [1, 2, 3];
    layers.forEach((layerNum) => {
      const color = getRandomColor();
      const layerElement = document.getElementById(`layer${layerNum}`);
      const colorDot = document.querySelector(
        `.color-dot-wrapper[data-layer="${layerNum}"] .color-dot`
      );
      const hsbSliders = document.querySelectorAll(
        `.color-dot-wrapper[data-layer="${layerNum}"] .hsb-slider`
      );

      // Convert hex to RGB
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);

      // Convert RGB to HSB
      const hsb = rgbToHsb(r, g, b);

      // Update layer and dot colors
      layerElement.style.color = color;
      colorDot.style.background = color;

      // Update HSB sliders
      hsbSliders[0].value = hsb.h;
      hsbSliders[1].value = hsb.s;
      hsbSliders[2].value = hsb.b;

      // Update CSS variables if color animation is active
      if (document.querySelector(".color-dot").classList.contains("selected")) {
        document.documentElement.style.setProperty(
          `--layer-${layerNum}-color`,
          color
        );
      }
    });
  }

  // Function to toggle fullscreen
  function toggleFullscreen() {
    const controls = document.querySelector(".controls");
    const textContainer = document.querySelector(".text-container");

    // Only move text if we're not in image mode
    if (!isImageMode) {
      // Force a reflow to ensure the transition is triggered
      void controls.offsetWidth;

      controls.classList.toggle("hidden");
      textContainer.style.transform = controls.classList.contains("hidden")
        ? "translateY(-65px)"
        : "translateY(0)";

      // Adjust text size based on fullscreen state
      const isFullscreen = controls.classList.contains("hidden");
      const scaleFactor = isFullscreen ? 1.05 : 1; // Scale up by 5% in fullscreen

      layers.forEach((layer) => {
        layer.style.fontSize = `${originalSize * scaleFactor}px`;
      });
    }
  }

  // Add variables to store layer states
  let previousLayerStates = {
    layer2: { opacity: "1", pointerEvents: "auto" },
    layer3: { opacity: "1", pointerEvents: "auto" },
  };

  // Add variable to track animation state
  let isAnimationPaused = false;

  // Add variable to track zero mode state
  let isZeroMode = false;
  let zeroModeStates = {
    layer2: { opacity: "1", pointerEvents: "auto" },
    layer3: { opacity: "1", pointerEvents: "auto" },
    weight: "101",
    width: "101%",
    animationState: "running",
  };

  // Add hotkey listeners
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isTyping) {
        document.activeElement.blur();
      } else if (isImageMode) {
        toggleImageMode();
      }
    }

    if (isTyping) return;

    // Get all visible layers
    const visibleLayers = document.querySelectorAll(
      ".text-layer:not([style*='opacity: 0'])"
    );
    if (visibleLayers.length === 0) return;

    // Small increment for smooth changes
    const increment = 0.5;

    // Handle Alt + arrow keys for text alignment
    if (e.altKey) {
      switch (e.key.toLowerCase()) {
        case "arrowleft":
          // Alt + Left: Left align
          visibleLayers.forEach((layer) => {
            layer.style.textAlign = "left";
            // If in sequential mode, update the text container alignment
            if (layer.classList.contains("sequential")) {
              const textContainer = layer.querySelector("div");
              if (textContainer) {
                textContainer.style.textAlign = "left";
              }
            }
          });
          // Update alignment dots
          document.querySelectorAll(".alignment-dot").forEach((dot) => {
            dot.classList.toggle("selected", dot.dataset.align === "left");
          });
          break;
        case "arrowdown":
          // Alt + Down: Center align
          visibleLayers.forEach((layer) => {
            layer.style.textAlign = "center";
            // If in sequential mode, update the text container alignment
            if (layer.classList.contains("sequential")) {
              const textContainer = layer.querySelector("div");
              if (textContainer) {
                textContainer.style.textAlign = "center";
              }
            }
          });
          // Update alignment dots
          document.querySelectorAll(".alignment-dot").forEach((dot) => {
            dot.classList.toggle("selected", dot.dataset.align === "center");
          });
          break;
        case "arrowright":
          // Alt + Right: Right align
          visibleLayers.forEach((layer) => {
            layer.style.textAlign = "right";
            // If in sequential mode, update the text container alignment
            if (layer.classList.contains("sequential")) {
              const textContainer = layer.querySelector("div");
              if (textContainer) {
                textContainer.style.textAlign = "right";
              }
            }
          });
          // Update alignment dots
          document.querySelectorAll(".alignment-dot").forEach((dot) => {
            dot.classList.toggle("selected", dot.dataset.align === "right");
          });
          break;
      }
      return; // Prevent other key handlers from running
    }

    switch (e.key.toLowerCase()) {
      case "arrowleft":
        if (e.shiftKey) {
          // Shift + Left: Move text left
          visibleLayers.forEach((layer) => {
            const currentTransform =
              layer.style.transform || "translate(-50%, -45%)";
            const transformMatch = currentTransform.match(
              /translate\(([^,]+),\s*([^)]+)\)/
            );
            const currentX = transformMatch
              ? parseFloat(transformMatch[1])
              : -50;
            const currentY = transformMatch
              ? parseFloat(transformMatch[2])
              : -45;
            layer.style.transform = `translate(${
              currentX - increment
            }%, ${currentY}%)`;
          });
        } else {
          // Left: Decrease letter spacing
          visibleLayers.forEach((layer) => {
            const currentLetterSpacing =
              parseFloat(layer.style.letterSpacing) || 0;
            layer.style.letterSpacing = `${currentLetterSpacing - increment}px`;
          });
        }
        break;
      case "arrowright":
        if (e.shiftKey) {
          // Shift + Right: Move text right
          visibleLayers.forEach((layer) => {
            const currentTransform =
              layer.style.transform || "translate(-50%, -45%)";
            const transformMatch = currentTransform.match(
              /translate\(([^,]+),\s*([^)]+)\)/
            );
            const currentX = transformMatch
              ? parseFloat(transformMatch[1])
              : -50;
            const currentY = transformMatch
              ? parseFloat(transformMatch[2])
              : -45;
            layer.style.transform = `translate(${
              currentX + increment
            }%, ${currentY}%)`;
          });
        } else {
          // Right: Increase letter spacing
          visibleLayers.forEach((layer) => {
            const currentLetterSpacing =
              parseFloat(layer.style.letterSpacing) || 0;
            layer.style.letterSpacing = `${currentLetterSpacing + increment}px`;
          });
        }
        break;
      case "arrowup":
        if (e.shiftKey) {
          // Shift + Up: Move text up
          visibleLayers.forEach((layer) => {
            const currentTransform =
              layer.style.transform || "translate(-50%, -45%)";
            const transformMatch = currentTransform.match(
              /translate\(([^,]+),\s*([^)]+)\)/
            );
            const currentX = transformMatch
              ? parseFloat(transformMatch[1])
              : -50;
            const currentY = transformMatch
              ? parseFloat(transformMatch[2])
              : -45;
            layer.style.transform = `translate(${currentX}%, ${
              currentY - increment
            }%)`;
          });
        } else {
          // Up: Decrease line height while maintaining container height
          visibleLayers.forEach((layer) => {
            const currentLineHeight =
              parseFloat(layer.style.lineHeight) || 0.95;
            const currentTransform =
              layer.style.transform || "translate(-50%, -45%)";
            const transformMatch = currentTransform.match(
              /translate\(([^,]+),\s*([^)]+)\)/
            );
            const currentX = transformMatch
              ? parseFloat(transformMatch[1])
              : -50;
            const currentY = transformMatch
              ? parseFloat(transformMatch[2])
              : -45;

            // Calculate new line height with smaller increment
            const newLineHeight = currentLineHeight - increment / 50;
            layer.style.lineHeight = `${newLineHeight}`;

            // Calculate padding adjustment based on line height change
            const paddingAdjustment = (currentLineHeight - newLineHeight) * 100;

            // Set minimum padding to prevent text cutoff
            const minPadding = 20;
            const currentPadding = parseFloat(layer.style.padding) || 0;
            const newPadding = Math.max(
              currentPadding + paddingAdjustment / 2,
              minPadding
            );
            layer.style.padding = `${newPadding}px`;

            // Ensure container has enough height
            layer.style.minHeight = `${
              layer.offsetHeight + paddingAdjustment
            }px`;

            // Adjust vertical position to keep text centered
            const yAdjustment = paddingAdjustment / 4;
            layer.style.transform = `translate(${currentX}%, ${
              currentY - yAdjustment
            }%)`;

            // If in sequential mode, update the text container and spans
            if (layer.classList.contains("sequential")) {
              const textContainer = layer.querySelector("div");
              if (textContainer) {
                textContainer.style.lineHeight = `${newLineHeight}`;
                textContainer.style.padding = `${newPadding}px`;
              }
              // Update all spans to maintain consistent line height
              const spans = layer.querySelectorAll("span");
              spans.forEach((span) => {
                span.style.lineHeight = `${newLineHeight}`;
              });
            }

            // Force a reflow to ensure styles are applied
            void layer.offsetHeight;
          });
        }
        break;
      case "arrowdown":
        if (e.shiftKey) {
          // Shift + Down: Move text down
          visibleLayers.forEach((layer) => {
            const currentTransform =
              layer.style.transform || "translate(-50%, -45%)";
            const transformMatch = currentTransform.match(
              /translate\(([^,]+),\s*([^)]+)\)/
            );
            const currentX = transformMatch
              ? parseFloat(transformMatch[1])
              : -50;
            const currentY = transformMatch
              ? parseFloat(transformMatch[2])
              : -45;
            layer.style.transform = `translate(${currentX}%, ${
              currentY + increment
            }%)`;
          });
        } else {
          // Down: Increase line height while maintaining container height
          visibleLayers.forEach((layer) => {
            const currentLineHeight =
              parseFloat(layer.style.lineHeight) || 0.95;
            const currentTransform =
              layer.style.transform || "translate(-50%, -45%)";
            const transformMatch = currentTransform.match(
              /translate\(([^,]+),\s*([^)]+)\)/
            );
            const currentX = transformMatch
              ? parseFloat(transformMatch[1])
              : -50;
            const currentY = transformMatch
              ? parseFloat(transformMatch[2])
              : -45;

            // Calculate new line height with smaller increment
            const newLineHeight = currentLineHeight + increment / 50;
            layer.style.lineHeight = `${newLineHeight}`;

            // Calculate padding adjustment based on line height change
            const paddingAdjustment = (newLineHeight - currentLineHeight) * 100;

            // Set minimum padding to prevent text cutoff
            const minPadding = 20;
            const currentPadding = parseFloat(layer.style.padding) || 0;
            const newPadding = Math.max(
              currentPadding + paddingAdjustment / 2,
              minPadding
            );
            layer.style.padding = `${newPadding}px`;

            // Ensure container has enough height
            layer.style.minHeight = `${
              layer.offsetHeight + paddingAdjustment
            }px`;

            // Adjust vertical position to keep text centered
            const yAdjustment = paddingAdjustment / 4;
            layer.style.transform = `translate(${currentX}%, ${
              currentY + yAdjustment
            }%)`;

            // If in sequential mode, update the text container and spans
            if (layer.classList.contains("sequential")) {
              const textContainer = layer.querySelector("div");
              if (textContainer) {
                textContainer.style.lineHeight = `${newLineHeight}`;
                textContainer.style.padding = `${newPadding}px`;
              }
              // Update all spans to maintain consistent line height
              const spans = layer.querySelectorAll("span");
              spans.forEach((span) => {
                span.style.lineHeight = `${newLineHeight}`;
              });
            }

            // Force a reflow to ensure styles are applied
            void layer.offsetHeight;
          });
        }
        break;
      case "0":
        isZeroMode = !isZeroMode;
        const layer2 = document.getElementById("layer2");
        const layer3 = document.getElementById("layer3");

        if (isZeroMode) {
          // Store current states
          zeroModeStates.layer2 = {
            opacity: layer2.style.opacity,
            pointerEvents: layer2.style.pointerEvents,
          };
          zeroModeStates.layer3 = {
            opacity: layer3.style.opacity,
            pointerEvents: layer3.style.pointerEvents,
          };
          // Store weight and width durations for all layers
          zeroModeStates.weightDurations = {};
          zeroModeStates.widthDurations = {};
          document.querySelectorAll(".text-layer").forEach((layer, index) => {
            zeroModeStates.weightDurations[`layer${index + 1}`] =
              layer.style.getPropertyValue("--weight-duration");
            zeroModeStates.widthDurations[`layer${index + 1}`] =
              layer.style.getPropertyValue("--width-duration");
          });
          zeroModeStates.animationState =
            document.querySelector(".text-layer").style.animationPlayState;

          // Pause animations and set fixed values
          document.querySelectorAll(".text-layer").forEach((layer) => {
            layer.style.animationPlayState = "paused";
            layer.style.setProperty("--weight-duration", "0s");
            layer.style.setProperty("--width-duration", "0s");
            layer.style.fontWeight = "99";
            layer.style.fontStretch = "99%";
            const spans = layer.querySelectorAll("span");
            spans.forEach((span) => {
              span.style.animationPlayState = "paused";
              span.style.setProperty("--weight-duration", "0s");
              span.style.setProperty("--width-duration", "0s");
              span.style.fontWeight = "99";
              span.style.fontStretch = "99%";
            });
          });

          // Hide layers 2 and 3
          layer2.style.opacity = "0";
          layer2.style.pointerEvents = "none";
          layer3.style.opacity = "0";
          layer3.style.pointerEvents = "none";

          // Update layer toggles
          document
            .querySelector('.layer-toggle[data-layer="2"]')
            .classList.remove("active");
          document
            .querySelector('.layer-toggle[data-layer="3"]')
            .classList.remove("active");
        } else {
          // Restore previous states
          layer2.style.opacity = zeroModeStates.layer2.opacity;
          layer2.style.pointerEvents = zeroModeStates.layer2.pointerEvents;
          layer3.style.opacity = zeroModeStates.layer3.opacity;
          layer3.style.pointerEvents = zeroModeStates.layer3.pointerEvents;

          // Restore weight and width durations for all layers
          document.querySelectorAll(".text-layer").forEach((layer, index) => {
            const layerNum = `layer${index + 1}`;
            layer.style.animationPlayState = zeroModeStates.animationState;
            layer.style.setProperty(
              "--weight-duration",
              zeroModeStates.weightDurations[layerNum]
            );
            layer.style.setProperty(
              "--width-duration",
              zeroModeStates.widthDurations[layerNum]
            );
            layer.style.fontWeight = "";
            layer.style.fontStretch = "";
            const spans = layer.querySelectorAll("span");
            spans.forEach((span) => {
              span.style.animationPlayState = zeroModeStates.animationState;
              span.style.setProperty(
                "--weight-duration",
                zeroModeStates.weightDurations[layerNum]
              );
              span.style.setProperty(
                "--width-duration",
                zeroModeStates.widthDurations[layerNum]
              );
              span.style.fontWeight = "";
              span.style.fontStretch = "";
            });
          });

          // Update layer toggles
          document
            .querySelector('.layer-toggle[data-layer="2"]')
            .classList.toggle("active", zeroModeStates.layer2.opacity === "1");
          document
            .querySelector('.layer-toggle[data-layer="3"]')
            .classList.toggle("active", zeroModeStates.layer3.opacity === "1");
        }
        break;
      case " ":
        // Toggle animation pause state
        isAnimationPaused = !isAnimationPaused;
        const textLayers = document.querySelectorAll(".text-layer");

        textLayers.forEach((layer) => {
          if (isAnimationPaused) {
            // Pause animations
            layer.style.animationPlayState = "paused";
            // Also pause animations on individual spans if in sequential mode
            const spans = layer.querySelectorAll("span");
            spans.forEach((span) => {
              span.style.animationPlayState = "paused";
            });
          } else {
            // Resume animations
            layer.style.animationPlayState = "running";
            // Also resume animations on individual spans if in sequential mode
            const spans = layer.querySelectorAll("span");
            spans.forEach((span) => {
              span.style.animationPlayState = "running";
            });
          }
        });
        break;
      case "b":
        // Toggle between regular and rounded font
        const layers = document.querySelectorAll(".text-layer");
        const isRounded =
          layers[0].style.fontFamily === "OffgridRounded, sans-serif";

        if (isRounded) {
          // Switching back to regular font - restore previous states
          const layer2 = document.getElementById("layer2");
          const layer3 = document.getElementById("layer3");
          layer2.style.opacity = previousLayerStates.layer2.opacity;
          layer2.style.pointerEvents = previousLayerStates.layer2.pointerEvents;
          layer3.style.opacity = previousLayerStates.layer3.opacity;
          layer3.style.pointerEvents = previousLayerStates.layer3.pointerEvents;

          // Update layer toggles
          document
            .querySelector('.layer-toggle[data-layer="2"]')
            .classList.toggle(
              "active",
              previousLayerStates.layer2.opacity === "1"
            );
          document
            .querySelector('.layer-toggle[data-layer="3"]')
            .classList.toggle(
              "active",
              previousLayerStates.layer3.opacity === "1"
            );
        } else {
          // Switching to rounded font - store current states and hide layers 2 and 3
          const layer2 = document.getElementById("layer2");
          const layer3 = document.getElementById("layer3");

          // Store current states
          previousLayerStates.layer2 = {
            opacity: layer2.style.opacity,
            pointerEvents: layer2.style.pointerEvents,
          };
          previousLayerStates.layer3 = {
            opacity: layer3.style.opacity,
            pointerEvents: layer3.style.pointerEvents,
          };

          // Hide layers 2 and 3
          layer2.style.opacity = "0";
          layer2.style.pointerEvents = "none";
          layer3.style.opacity = "0";
          layer3.style.pointerEvents = "none";

          // Update layer toggles
          document
            .querySelector('.layer-toggle[data-layer="2"]')
            .classList.remove("active");
          document
            .querySelector('.layer-toggle[data-layer="3"]')
            .classList.remove("active");
        }

        // Store current styles before switching fonts
        const currentLineHeight = layers[0].style.lineHeight;
        const currentPadding = layers[0].style.padding;
        const currentTransform = layers[0].style.transform;
        const currentLetterSpacing = layers[0].style.letterSpacing;

        // Switch the font
        layers.forEach((layer) => {
          layer.style.fontFamily = isRounded
            ? "Offgrid, sans-serif"
            : "OffgridRounded, sans-serif";
          // Restore styles after font switch
          layer.style.lineHeight = currentLineHeight;
          layer.style.padding = currentPadding;
          layer.style.transform = currentTransform;
          layer.style.letterSpacing = currentLetterSpacing;
        });

        // If in sequential mode, update the spans
        if (layers[0].classList.contains("sequential")) {
          updateLetterSpans();
        }
        break;
      case "r":
        if (e.ctrlKey || e.metaKey) {
          const recordDot = document.querySelector(".record-dot");
          if (recordDot) {
            recordDot.click();
          }
        } else {
          updateLayerColors();
        }
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

  // Add event listeners for image controls
  const imageZoomSlider = document.getElementById("imageZoom");
  const imagePositionXSlider = document.getElementById("imagePositionX");
  const imagePositionYSlider = document.getElementById("imagePositionY");

  if (imageZoomSlider) {
    imageZoomSlider.addEventListener("input", () => {
      imageZoom = parseInt(imageZoomSlider.value);
      drawImage();
    });
  }

  if (imagePositionXSlider) {
    imagePositionXSlider.addEventListener("input", () => {
      drawImage();
    });
  }

  if (imagePositionYSlider) {
    imagePositionYSlider.addEventListener("input", () => {
      drawImage();
    });
  }

  // Reset image position when exiting image mode
  function resetImagePosition() {
    imageOffsetX = 0;
    imageOffsetY = 0;
    imageZoom = 100;
    if (imageZoomSlider) imageZoomSlider.value = 100;
    if (imagePositionXSlider) imagePositionXSlider.value = 0;
    if (imagePositionYSlider) imagePositionYSlider.value = 0;
  }

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

  // Add click handler to the upload button
  uploadButton.addEventListener("click", () => {
    console.log("Upload button clicked");
    imageUpload.click();
  });

  // Add event listeners for pattern selection
  document.querySelectorAll(".pattern-dot").forEach((dot) => {
    dot.addEventListener("click", () => {
      // Remove selected class from all dots
      document.querySelectorAll(".pattern-dot").forEach((d) => {
        d.classList.remove("selected");
      });
      // Add selected class to clicked dot
      dot.classList.add("selected");
      // Update current pattern
      currentPattern = dot.dataset.pattern;
      // Redraw the image
      drawImage();
    });
  });

  // Load default image after all handlers are defined
  const defaultImage = new Image();
  defaultImage.src = "bouncy-castle.jpg.webp";
  defaultImage.onload = function () {
    originalImage = defaultImage;
    drawImage();
  };

  // Function to start recording
  /*
  function startRecording() {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    // Set canvas size with higher resolution
    const scale = 2; // Scale factor for higher resolution
    canvas.width = window.innerWidth * scale;
    canvas.height = window.innerHeight * scale;

    // Scale the context to match the higher resolution
    ctx.scale(scale, scale);

    // Get supported mime type
    const mimeTypes = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
      "video/mp4",
    ];

    let selectedMimeType = "";
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeType;
        break;
      }
    }

    if (!selectedMimeType) {
      alert("Video recording is not supported in your browser.");
      return;
    }

    const stream = canvas.captureStream(60); // 60 FPS for smoother animation
    recorder = new MediaRecorder(stream, {
      mimeType: selectedMimeType,
      videoBitsPerSecond: 8000000, // 8 Mbps for higher quality
    });
    const chunks = [];

    // Start recording
    recorder.start();
    isRecording = true;

    const startTime = Date.now();
    let frameCount = 0;

    function draw() {
      if (!isRecording) return;

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

        // Get the correct animation durations from CSS variables
        const weightDuration =
          parseFloat(layer.style.getPropertyValue("--weight-duration")) || 3;
        const widthDuration =
          parseFloat(layer.style.getPropertyValue("--width-duration")) || 3;
        const layerDelay = parseFloat(layer.style.animationDelay) || 0;

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

              // Calculate both weight and width animations
              const weightTime = (currentTime - spanDelay) % weightDuration;
              const widthTime = (currentTime - spanDelay) % widthDuration;
              const weightProgress = weightTime / weightDuration;
              const widthProgress = widthTime / widthDuration;

              // Calculate font weight and stretch using the same animation curves as CSS
              // Using exact ranges from CSS keyframes: 101-200 for weight, 101%-200% for stretch
              const weight = 101 + 99 * Math.sin(weightProgress * Math.PI);
              const stretch = 101 + 99 * Math.sin(widthProgress * Math.PI);

              // Set both font-weight and font-stretch
              ctx.font = `${weight} ${stretch}% ${fontSize}px Offgrid`;
              ctx.fillStyle = layer.style.color;
              ctx.textAlign = "left";
              ctx.textBaseline = "middle";

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
          const weightTime = (currentTime - layerDelay) % weightDuration;
          const widthTime = (currentTime - layerDelay) % widthDuration;
          const weightProgress = weightTime / weightDuration;
          const widthProgress = widthTime / widthDuration;

          // Calculate font weight and stretch using the same animation curves as CSS
          // Using exact ranges from CSS keyframes: 101-200 for weight, 101%-200% for stretch
          const weight = 101 + 99 * Math.sin(weightProgress * Math.PI);
          const stretch = 101 + 99 * Math.sin(widthProgress * Math.PI);

          // Set both font-weight and font-stretch
          ctx.font = `${weight} ${stretch}% ${fontSize}px Offgrid`;
          ctx.fillStyle = layer.style.color;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";

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

      requestAnimationFrame(draw);
    }

    draw();

    recorder.ondataavailable = (e) => chunks.push(e.data);
    recorder.onstop = () => {
      const extension = selectedMimeType.includes("webm") ? "webm" : "mp4";
      const blob = new Blob(chunks, { type: selectedMimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `variable-font-animation.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
  }

  // Function to stop recording
  function stopRecording() {
    if (!recorder || !isRecording) return;
    isRecording = false;
    recorder.stop();
  }

  // Handle record button click
  document.addEventListener("click", (e) => {
    if (e.target.classList.contains("record-dot")) {
      const isOn = e.target.classList.contains("selected");

      // Toggle selected class
      e.target.classList.toggle("selected");

      if (!isOn) {
        startRecording();
      } else {
        stopRecording();
      }
    }
  });
  */
});
