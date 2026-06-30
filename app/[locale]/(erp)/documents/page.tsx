'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  FolderOpen, Plus, Search, Eye, Download, FileText,
  HardDrive, Trash2, X, Loader2, AlertCircle
} from 'lucide-react';

function formatBytes(bytes: number, decimals = 1) {
  if (!bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const CATEGORIES_LIST = ['Contrats', 'Assurances', 'Cartes grises', 'Factures', 'Bulletins de paie'];

export default function DocumentsPage() {
  const supabase = createClient();

  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasStorageError, setHasStorageError] = useState(false);

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('Tous');

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Contrats');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setHasStorageError(false);
    try {
      const allFiles: any[] = [];
      
      const results = await Promise.all(
        CATEGORIES_LIST.map(async (cat) => {
          const { data, error } = await supabase.storage.from('documents').list(cat);
          if (error) {
            if (error.message.includes('bucket') || error.message.includes('not found') || error.message.includes('does not exist')) {
              throw new Error('Bucket not found');
            }
          }
          return { cat, data };
        })
      );

      results.forEach(({ cat, data }) => {
        if (data) {
          data.forEach((file) => {
            if (file.name !== '.empty') {
              allFiles.push({
                id: file.id || file.name,
                name: file.name,
                size: formatBytes(file.metadata?.size || 0),
                rawSize: file.metadata?.size || 0,
                category: cat,
                date: file.created_at ? new Date(file.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                owner: 'Administrateur'
              });
            }
          });
        }
      });

      setDocuments(allFiles);
    } catch (err: any) {
      console.warn('Supabase Storage not accessible, loading mock data:', err.message);
      setHasStorageError(true);
      // Fallback mock documents
      setDocuments([
        { id: '1', name: 'Contrat_CDI_Ibrahima_Diallo.pdf', size: '1.2 MB', rawSize: 1_200_000, category: 'Contrats', date: '2026-06-20', owner: 'Mamadou Ndiaye' },
        { id: '2', name: 'Attestation_Assurance_TN-4821-AB.pdf', size: '4.8 MB', rawSize: 4_800_000, category: 'Assurances', date: '2026-06-18', owner: 'Cheikh Fall' },
        { id: '3', name: 'Carte_Grise_TN-3356-CD.pdf', size: '2.1 MB', rawSize: 2_100_000, category: 'Cartes grises', date: '2026-06-15', owner: 'Oumar Seck' },
        { id: '4', name: 'Facture_F2026-0847_SHELL.pdf', size: '345 KB', rawSize: 345_000, category: 'Factures', date: '2026-06-25', owner: 'Aminata Fall' },
        { id: '5', name: 'Bulletin_Paie_Juin_Oumar_Seck.pdf', size: '620 KB', rawSize: 620_000, category: 'Bulletins de paie', date: '2026-06-24', owner: 'Mamadou Ndiaye' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsSaving(true);
    try {
      // Remove special characters from file name
      const sanitizedName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filePath = `${selectedCategory}/${sanitizedName}`;

      const { error } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, { upsert: true });

      if (error) throw error;
      
      await fetchData();
      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Erreur lors du transfert du document. Assurez-vous que le bucket "documents" est configuré public.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = (doc: any) => {
    if (hasStorageError) {
      alert('Mode Démo : Fichier fictif non disponible en téléchargement physique.');
      return;
    }
    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(`${doc.category}/${doc.name}`);

    if (data?.publicUrl) {
      window.open(data.publicUrl, '_blank');
    }
  };

  const handleDelete = async (doc: any) => {
    if (hasStorageError) {
      alert('Mode Démo : Impossible de supprimer les fichiers de démonstration.');
      return;
    }
    if (!confirm(`Voulez-vous vraiment supprimer le document "${doc.name}" ?`)) return;

    try {
      const { error } = await supabase.storage
        .from('documents')
        .remove([`${doc.category}/${doc.name}`]);

      if (error) throw error;
      await fetchData();
    } catch (err) {
      console.error('Error deleting document:', err);
      alert('Erreur lors de la suppression.');
    }
  };

  // Stats
  const totalBytesUsed = documents.reduce((s, d) => s + (d.rawSize || 0), 0);
  
  const categoriesStats = CATEGORIES_LIST.map(catName => ({
    name: catName,
    count: documents.filter(d => d.category === catName).length
  }));

  const filtered = documents.filter(d => {
    const matchSearch = search === '' || d.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'Tous' || d.category === catFilter;
    return matchSearch && matchCat;
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        <p className="text-sm text-text-secondary">Chargement du coffre-fort...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-brand-700" /> Gestion documentaire
          </h1>
          <p className="text-sm text-text-secondary mt-0.5">Coffre-fort numérique sécurisé pour les documents de la société</p>
        </div>
        <button onClick={() => setShowUploadModal(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Importer un document
        </button>
      </div>

      {hasStorageError && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3 text-sm text-amber-800">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold">Mode Démo Activé</p>
            <p className="mt-0.5 leading-relaxed opacity-90">
              Le bucket de stockage de fichiers "documents" n'est pas encore créé ou accessible sur Supabase. 
              L'interface affiche actuellement des fichiers d'exemple fictifs. Créez un bucket public nommé <strong>documents</strong> dans la console Supabase pour tester de vrais imports.
            </p>
          </div>
        </div>
      )}

      {/* Categories & Storage Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 section-card p-4 flex flex-wrap gap-2 items-center bg-white">
          <button
            onClick={() => setCatFilter('Tous')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
              catFilter === 'Tous'
                ? 'bg-brand-700 text-white border-brand-700'
                : 'bg-white text-text-secondary border-surface-border hover:border-brand-200'
            }`}
          >
            Tous ({documents.length})
          </button>
          {categoriesStats.map(c => (
            <button
              key={c.name}
              onClick={() => setCatFilter(c.name)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${
                catFilter === c.name
                  ? 'bg-brand-700 text-white border-brand-700'
                  : 'bg-white text-text-secondary border-surface-border hover:border-brand-200'
              }`}
            >
              {c.name} ({c.count})
            </button>
          ))}
        </div>
        <div className="kpi-card flex items-center gap-4 bg-white">
          <div className="w-10 h-10 bg-brand-50 text-brand-700 rounded-lg flex items-center justify-center flex-shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-text-secondary uppercase tracking-wide">Espace Utilisé</p>
            <p className="text-lg font-bold text-text-primary mt-0.5">{formatBytes(totalBytesUsed)} / 10 GB</p>
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="section-card">
        <div className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              className="input pl-9"
              placeholder="Rechercher par nom de fichier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nom du fichier</th>
                <th>Taille</th>
                <th>Catégorie</th>
                <th>Date d'ajout</th>
                <th>Dépositaire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-surface-hover/35 transition-all">
                  <td className="font-semibold text-text-primary text-sm flex items-center gap-2 py-4">
                    <FileText className="w-4 h-4 text-brand-700" />
                    <span className="truncate max-w-[300px]">{d.name}</span>
                  </td>
                  <td className="text-xs text-text-secondary font-mono">{d.size}</td>
                  <td>
                    <span className="badge bg-brand-50 text-brand-700">
                      {d.category}
                    </span>
                  </td>
                  <td className="text-xs text-text-secondary">{new Date(d.date).toLocaleDateString('fr-FR')}</td>
                  <td className="text-xs font-medium text-text-primary">{d.owner}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleDownload(d)} className="btn-ghost p-1.5" title="Consulter / Télécharger"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(d)} className="btn-ghost p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700" title="Supprimer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="p-12 text-center text-text-muted">
            <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun document trouvé</p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl border border-surface-border w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-surface-border">
              <h3 className="text-lg font-bold text-text-primary">Importer un document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Fichier *</label>
                <input
                  type="file"
                  required
                  className="input py-2"
                  onChange={handleFileChange}
                />
              </div>

              <div>
                <label className="label">Catégorie *</label>
                <select
                  required
                  className="input"
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                >
                  {CATEGORIES_LIST.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="btn-ghost"
                  disabled={isSaving}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isSaving || !selectedFile}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" /> Transfert...
                    </span>
                  ) : (
                    'Uploader'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
