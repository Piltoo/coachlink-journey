
interface CreateModalProps {
  title: string;
  content: HTMLElement;
}

export const createModal = ({ title, content }: CreateModalProps) => {
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '50%';
  modal.style.left = '50%';
  modal.style.transform = 'translate(-50%, -50%)';
  modal.style.backgroundColor = 'white';
  modal.style.padding = '20px';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
  modal.style.zIndex = '1000';
  modal.style.width = '400px';
  modal.style.maxWidth = '90vw';
  
  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  titleElement.style.marginBottom = '16px';
  titleElement.style.fontWeight = 'bold';
  titleElement.style.fontSize = '18px';
  
  const buttons = document.createElement('div');
  buttons.style.display = 'flex';
  buttons.style.gap = '8px';
  buttons.style.marginTop = '16px';
  buttons.style.justifyContent = 'flex-end';
  
  const confirmButton = document.createElement('button');
  confirmButton.textContent = 'Confirm';
  confirmButton.className = 'bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700';
  
  const cancelButton = document.createElement('button');
  cancelButton.textContent = 'Cancel';
  cancelButton.className = 'bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300';
  
  buttons.appendChild(cancelButton);
  buttons.appendChild(confirmButton);
  
  modal.appendChild(titleElement);
  modal.appendChild(content);
  modal.appendChild(buttons);
  
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '999';
  
  document.body.appendChild(overlay);
  document.body.appendChild(modal);
  
  return new Promise((resolve) => {
    const cleanup = () => {
      document.body.removeChild(modal);
      document.body.removeChild(overlay);
    };
    
    confirmButton.onclick = () => {
      let result = null;
      if (content.querySelector('#password-confirmation')) {
        result = (content.querySelector('#password-confirmation') as HTMLInputElement).value;
      }
      cleanup();
      resolve(result || true);
    };
    
    cancelButton.onclick = () => {
      cleanup();
      resolve(false);
    };
    
    overlay.onclick = () => {
      cleanup();
      resolve(false);
    };
  });
};
