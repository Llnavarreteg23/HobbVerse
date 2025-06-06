// Configuracion de Cloudinary para la carga de imágenes
const cloudinaryConfig = {
    cloudName: 'YOUR_CLOUD_NAME',
    uploadPreset: 'YOUR_UPLOAD_PRESET',
    apiKey: 'YOUR_API_KEY',
    apiSecret: 'YOUR_API_SECRET'
};

// Cargar Configuración de Cloudinary
const uploadWidget = cloudinary.createUploadWidget({
    cloudName: cloudinaryConfig.cloudName,
    uploadPreset: cloudinaryConfig.uploadPreset,
    multiple: true,
    maxFiles: 5,
    sources: ['local', 'url', 'camera'],
    showAdvancedOptions: false,
    cropping: false,
    styles: {
        palette: {
            window: "#FFFFFF",
            windowBorder: "#90A0B3",
            tabIcon: "#0078FF",
            menuIcons: "#5A616A",
            textDark: "#000000",
            textLight: "#FFFFFF",
            link: "#0078FF",
            action: "#FF620C",
            inactiveTabIcon: "#0E2F5A",
            error: "#F44235",
            inProgress: "#0078FF",
            complete: "#20B832",
            sourceBg: "#E4EBF1"
        }
    }
}, (error, result) => {
    if (!error && result && result.event === "success") {
        // Manejo de la respuesta exitosa
        console.log('Upload successful:', result.info);
        
        const uploadEvent = new CustomEvent('imageUploaded', { 
            detail: result.info 
        });
        document.dispatchEvent(uploadEvent);
    }
});

// Funciones utilitarias para Cloudinary
const cloudinaryUtils = {
    // Abrir el widget de carga
    openUploadWidget: () => {
        uploadWidget.open();
    },

    // Url de imagen optimizada
    getOptimizedUrl: (publicId, options = {}) => {
        return cloudinary.url(publicId, {
            quality: 'auto',
            fetch_format: 'auto',
            ...options
        });
    },

    // Transformar imagen con opciones
    transformImage: (url, options = {}) => {
        return cloudinary.url(url, {
            transformation: [
                { width: options.width || 'auto' },
                { quality: options.quality || 'auto' },
                { fetch_format: options.format || 'auto' },
                ...(options.additional || [])
            ]
        });
    }
};

export { cloudinaryConfig, cloudinaryUtils };