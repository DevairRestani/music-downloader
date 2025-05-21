import styles from '../styles/components/Formulatio.module.css';
import { SyntheticEvent, useState, useEffect } from 'react';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { MdCloudDownload } from 'react-icons/md';

export default function Formulario() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clear error message after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000); // Or a different duration for errors
      return () => clearTimeout(timer);
    }
  }, [error]);


  function HandleSubmit(e: SyntheticEvent): void {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const fullUrl = window.location.origin;

    axios({
      url: `${fullUrl}/api/Download/`,
      method: 'POST',
      responseType: 'blob', // Keep as blob for successful file downloads
      data: { url },
    })
      .then((res) => {
        const header: string = res.headers['content-disposition'];
        let fileName = 'downloaded.mp3'; // Default filename
        if (header) {
            const fileNameMatch = header.match(/filename="?(.+?)"?$/);
            if (fileNameMatch && fileNameMatch[1]) {
                fileName = fileNameMatch[1].replaceAll('"', '');
            }
        }
        
        fileDownload(res.data, fileName);
        setSuccessMessage(`Download iniciado: ${fileName}`);
        setUrl(''); // Clear the input field on success
      })
      .catch((err) => {
        if (err.response && err.response.data && err.response.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = function() {
            try {
              const errorData = JSON.parse(reader.result as string);
              setError(errorData.message || 'Ocorreu um erro ao processar o vídeo.');
            } catch (parseError) {
              setError('Ocorreu um erro e não foi possível ler a mensagem de erro do servidor.');
            }
          };
          reader.onerror = function() {
            setError('Ocorreu um erro ao tentar ler a resposta de erro do servidor.');
          };
          reader.readAsText(err.response.data);
        } else if (err.request) {
          setError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.');
        } else {
          setError(`Erro ao configurar o pedido: ${err.message}`);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (error) setError(null); // Clear error when user types
    if (successMessage) setSuccessMessage(null); // Clear success message when user types
  };

  return (
    <div className={styles.FormularioContainer}>
      <h1>Download de playlist em mp3</h1>
      <form onSubmit={HandleSubmit}>
        <input
          placeholder="URL do vídeo ou playlist do YouTube"
          onChange={handleUrlChange}
          value={url}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Baixando...' : 'Baixar'} <MdCloudDownload size="20" />
        </button>
      </form>
      {successMessage && (
        <div className={`${styles.feedbackMessage} ${styles.successMessage}`}>
          {successMessage}
        </div>
      )}
      {error && (
        <div className={`${styles.feedbackMessage} ${styles.errorMessage}`}>
          {error}
        </div>
      )}
    </div>
  );
}
