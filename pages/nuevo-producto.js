import React, { useState, useContext } from 'react';
import { css } from '@emotion/react';
import Router, { useRouter } from 'next/router';
import FileUploader from 'react-firebase-file-uploader';
import Layout from '../components/layout/Layout';
import { Formulario, Campo, InputSubmit, Error } from '../components/ui/Formulario';

import { FirebaseContext } from '../firebase';

// validaciones
import useValidacion from '../hooks/useValidacion';
import validarCrearProducto from '../validacion/validarCrearProducto';
// import { firestore } from 'firebase-admin';

const STATE_INICIAL = {
    nombre: '',
    empresa: '',
    imagen: '',
    url: '',
    descripcion: ''
}

const NuevoProducto = () => {
    //state de las imagenes
    const [nombreImagen, setNombreImagen] = useState('');
    const [subiendo, setSubiendo] = useState(false);
    const [progreso, setProgreso] = useState(0);
    const [urlimagen, setUrlImagen] = useState('');

    const [error, setError] = useState(false);

    const { valores, errores, handleSubmit, handleChange, handleBlur } = useValidacion(STATE_INICIAL, validarCrearProducto, crearProducto);

    const { nombre, empresa, imagen, url, descripcion } = valores;

    //Hook de routing para redireccionar
    const router = useRouter();

    // Context con las operacion CRUD de firebase
    const { usuario, firebase } = useContext(FirebaseContext);

    async function crearProducto() {
        if (!usuario) {
            return router.push('/login');
        }

        const producto = {
            nombre,
            empresa,
            url,
            urlimagen,
            descripcion,
            votos: 0,
            comentarios: [],
            creado: Date.now(),
            creador: {
                id: usuario.uid,
                nombre: usuario.displayName
            }
        }
        console.log("Pasé por crear producto");
        
        //inserta en la base de datos
        await firebase.db.collection('productos').add(producto);

        return router.push('/');
    }

    const handleUploadStart = () => {
        setProgreso(0);
        setSubiendo(true);
    }

    const handleProgress = progreso => setProgreso({ progreso });

    const handleUploadError = error => {
        setSubiendo(error);
        console.log(error);
    };

    const handleUploadSuccess = nombre => {
        setProgreso(100);
        setSubiendo(false);
        setNombreImagen(nombre);
        firebase
            .storage
            .ref('productos')
            .child(nombre)
            .getDownloadURL()
            .then(url => {
                console.log("pasó por acá", url);
                setUrlImagen(url);
            }
            );
    };

    return (
        <div>
            <Layout>
                <>
                    <h1
                        css={css`
                            text-align: center;
                            margin-top: 5rem;
                        `}
                    >Nuevo Producto</h1>
                    <Formulario
                        onSubmit={handleSubmit}
                    >
                        <fieldset>
                            <legend>información general</legend>
                            <Campo>
                                <label htmlFor="nombre">Nombre</label>
                                <input
                                    type="text"
                                    id="nombre"
                                    placeholder="Tu nombre"
                                    name="nombre"
                                    value={nombre}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Campo>

                            {errores.nombre && <Error>{errores.nombre}</Error>}

                            <Campo>
                                <label htmlFor="empresa">Empresa</label>
                                <input
                                    type="text"
                                    id="empresa"
                                    placeholder="nombre de tu empresa o compañia"
                                    name="empresa"
                                    value={empresa}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Campo>

                            {errores.empresa && <Error>{errores.empresa}</Error>}

                            <Campo>
                                <label htmlFor="imagen">Imagen</label>
                                <FileUploader
                                    accept="image/*"
                                    id="imagen"
                                    name="imagen"
                                    randomizeFilename
                                    storageRef={firebase.storage.ref("productos")}
                                    onUploadStart={handleUploadStart}
                                    onUploadError={handleUploadError}
                                    onUploadSuccess={handleUploadSuccess}
                                    onProgress={handleProgress}
                                />
                            </Campo>

                            <Campo>
                                <label htmlFor="url">URL</label>
                                <input
                                    type="url"
                                    id="url"
                                    name="url"
                                    placeholder='URL de tu producto'
                                    value={url}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Campo>

                            {errores.url && <Error>{errores.url}</Error>}

                        </fieldset>
                        <fieldset>
                            <legend>Sobre tu producto</legend>

                            <Campo>
                                <label htmlFor="descripcion">Descripcion</label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={descripcion}
                                    onChange={handleChange}
                                    onBlur={handleBlur}
                                />
                            </Campo>

                            {errores.descripcion && <Error>{errores.descripcion}</Error>}

                        </fieldset>

                        {error && <Error>{error}</Error>}

                        <InputSubmit
                            type="submit"
                            value="Crear Producto"
                        />
                    </Formulario>
                </>
            </Layout>
        </div>
    )
};

export default NuevoProducto;
