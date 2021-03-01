import styles from '../styles/components/Formulatio.module.css';
import { SyntheticEvent, useState } from 'react';
import axios from 'axios';
import fileDownload from 'js-file-download';
import { MdCloudDownload } from 'react-icons/md';

export default function Formulario() {
  const [url, setUrl] = useState('');

  function HandleSubmit(e: SyntheticEvent): void {
    e.preventDefault();

    const fullUrl =
      window.location.protocol +
      '//' +
      window.location.hostname +
      (window.location.port ? ':' + window.location.port : '');

    axios({
      url: fullUrl + '/api/Download/',
      method: 'POST',
      responseType: 'blob',
      data: { url },
    })
      .then((res) => {
        const header: String = res.headers['content-disposition'];
        const fileName = header
          .slice(header.indexOf('=') + 1, header.length)
          .replaceAll('"', '');

        fileDownload(res.data, fileName);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <div className={styles.FormularioContainer}>
      <h1>Download de playlist em mp3</h1>
      <form onSubmit={HandleSubmit}>
        <input
          placeholder="URL"
          onChange={(e) => setUrl(e.target.value)}
          value={url}
        />
        <button type="submit">
          Baixar <MdCloudDownload size="20" />
        </button>
      </form>
    </div>
  );
}
