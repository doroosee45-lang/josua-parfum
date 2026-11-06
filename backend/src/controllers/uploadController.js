export async function handlePhotoUpload(req, res) {
  const files = req.files || (req.file ? [req.file] : []);
  if (!files || files.length === 0) {
    return res.status(400).json({
      message: 'Aucune photo reçue. Veuillez sélectionner une image depuis votre téléphone.',
    });
  }

  const urls = files.map((file) => `/uploads/${file.filename}`);
  return res.status(201).json({
    urls,
    count: urls.length,
    message: 'Photo(s) enregistrée(s) en ligne avec succès.',
  });
}
