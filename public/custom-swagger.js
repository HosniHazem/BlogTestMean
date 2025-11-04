// Custom Swagger UI script to enhance authorization
(function () {
  "use strict";

  // Wait for Swagger UI to be fully loaded
  if (window.addEventListener) {
    window.addEventListener("load", init, false);
  } else if (window.attachEvent) {
    window.attachEvent("onload", init);
  }

  function init() {
    setTimeout(function () {
      // Ensure authorize button is visible
      const authorizeBtn = document.querySelector(".btn.authorize");
      if (authorizeBtn) {
        authorizeBtn.style.display = "inline-block";
        authorizeBtn.setAttribute("aria-label", "Authorize API");
      }

      // Add instructions banner
      addAuthInstructions();

      // Enhance the authorize modal
      enhanceAuthorizeModal();
    }, 1000);
  }

  function addAuthInstructions() {
    const infoContainer = document.querySelector(".info");
    if (infoContainer && !document.querySelector(".auth-helper-banner")) {
      const banner = document.createElement("div");
      banner.className = "auth-helper-banner";
      banner.style.cssText =
        "background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);";
      banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 15px;">
          <div style="font-size: 32px;">🔐</div>
          <div style="flex: 1;">
            <h3 style="margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Authentication Required</h3>
            <p style="margin: 0 0 10px 0; opacity: 0.95; line-height: 1.6;">
              Most endpoints require authentication. To test them:
            </p>
            <ol style="margin: 0; padding-left: 20px; opacity: 0.95;">
              <li>First, call <strong>POST /api/auth/login</strong> to get your JWT token</li>
              <li>Click the <strong>"Authorize"</strong> button (🔓 icon) at the top right</li>
              <li>Paste your token in the field (without "Bearer" prefix)</li>
              <li>Click "Authorize" then "Close"</li>
              <li>Now you can test authenticated endpoints!</li>
            </ol>
          </div>
        </div>
      `;
      infoContainer.insertBefore(banner, infoContainer.firstChild);
    }
  }

  function enhanceAuthorizeModal() {
    // Watch for modal opens
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (
            node.nodeType === 1 &&
            node.classList &&
            node.classList.contains("dialog-ux")
          ) {
            setTimeout(function () {
              const authInput = node.querySelector(
                'input[type="text"], input[type="password"]'
              );
              if (authInput && !authInput.dataset.enhanced) {
                authInput.dataset.enhanced = "true";
                authInput.placeholder =
                  "Enter your JWT token (from POST /api/auth/login)";
                authInput.type = "text"; // Changed from password to see the token

                // Add helper text below input
                const inputWrapper = authInput.parentElement;
                if (
                  inputWrapper &&
                  !inputWrapper.querySelector(".token-helper")
                ) {
                  const helper = document.createElement("div");
                  helper.className = "token-helper";
                  helper.style.cssText =
                    "margin-top: 8px; font-size: 12px; color: #666;";
                  helper.innerHTML =
                    "💡 Get your token from <strong>POST /api/auth/login</strong>. Copy the <code>accessToken</code> value from the response.";
                  inputWrapper.appendChild(helper);
                }
              }
            }, 100);
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }
})();
