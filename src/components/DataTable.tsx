import React, { useState } from 'react';
import { ExportButtons } from './ExportButtons';
import { TableType } from '@/hooks/useRuralData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface DataTableProps {
  data: any[];
  loading: boolean;
  error: string | null;
  tableType: TableType;
  onDataUpdate?: () => void;
  isCollaborator?: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({ 
  data, 
  loading, 
  error, 
  tableType, 
  onDataUpdate,
  isCollaborator = false 
}) => {
  const { toast } = useToast();
  const [editingRow, setEditingRow] = useState<any>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [deleteRowId, setDeleteRowId] = useState<string | number | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getTableConfig = (type: TableType) => {
    switch (type) {
      case 'plantio':
        return {
          title: 'Plantio',
          columns: [
            { key: 'data_plantio', label: 'Data', type: 'date' },
            { key: 'cultura', label: 'Cultura', type: 'text' },
            { key: 'area_plantada', label: 'Área Plantada', type: 'number', suffix: ' ha' },
            { key: 'registrado_por', label: 'Registrado Por', type: 'text' }
          ]
        };
      case 'colheita':
        return {
          title: 'Colheita',
          columns: [
            { key: 'data_colheita', label: 'Data', type: 'date' },
            { key: 'cultura', label: 'Cultura', type: 'text' },
            { key: 'quantidade', label: 'Quantidade', type: 'number', suffix: ' kg' },
            { key: 'registrado_por', label: 'Registrado Por', type: 'text' }
          ]
        };
      case 'venda':
        return {
          title: 'Venda',
          columns: [
            { key: 'data_venda', label: 'Data', type: 'date' },
            { key: 'cultura', label: 'Cultura', type: 'text' },
            { key: 'quantidade', label: 'Quantidade', type: 'number', suffix: ' kg' },
            { key: 'valor_total', label: 'Valor Total', type: 'currency' },
            { key: 'registrado_por', label: 'Registrado Por', type: 'text' }
          ]
        };
      case 'gasto':
        return {
          title: 'Gasto',
          columns: [
            { key: 'data_gasto', label: 'Data', type: 'date' },
            { key: 'tipo', label: 'Tipo', type: 'text' },
            { key: 'descricao', label: 'Descrição', type: 'text' },
            { key: 'valor', label: 'Valor', type: 'currency' },
            { key: 'registrado_por', label: 'Registrado Por', type: 'text' }
          ]
        };
      case 'insumo':
        return {
          title: 'Insumo',
          columns: [
            { key: 'nome', label: 'Nome', type: 'text' },
            { key: 'tipo', label: 'Tipo', type: 'text' },
            { key: 'quantidade', label: 'Quantidade', type: 'number' },
            { key: 'preco_unitario', label: 'Preço Unitário', type: 'currency' },
            { key: 'registrado_por', label: 'Registrado Por', type: 'text' }
          ]
        };
      case 'trabalho':
        return {
          title: 'Trabalho',
          columns: [
            { key: 'descricao', label: 'Descrição', type: 'text' },
            { key: 'responsavel', label: 'Responsável', type: 'text' },
            { key: 'custo', label: 'Custo', type: 'currency' },
            { key: 'registrado_por', label: 'Registrado Por', type: 'text' }
          ]
        };
    }
  };

  const formatValue = (value: any, type: string, suffix?: string) => {
    if (value === null || value === undefined) return '-';

    switch (type) {
      case 'date':
        return new Date(value).toLocaleDateString('pt-BR');
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL'
        }).format(Number(value) || 0);
      case 'number':
        return `${Number(value).toLocaleString('pt-BR')}${suffix || ''}`;
      default:
        return value?.toString() || '-';
    }
  };

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  const validateField = (key: string, value: any, type: string) => {
    if (!value && value !== 0) return 'Campo obrigatório';
    
    switch (type) {
      case 'date':
        if (!Date.parse(value)) return 'Data inválida';
        break;
      case 'number':
      case 'currency':
        if (isNaN(Number(value)) || Number(value) < 0) return 'Deve ser um número positivo';
        break;
      case 'text':
        if (typeof value !== 'string' || value.trim() === '') return 'Campo obrigatório';
        break;
    }
    return null;
  };

  const handleEdit = (row: any) => {
    setEditingRow(row);
    const formData = { ...row };
    const config = getTableConfig(tableType);
    
    config.columns.forEach(col => {
      if (col.type === 'date' && formData[col.key]) {
        formData[col.key] = formatDateForInput(formData[col.key]);
      }
    });
    
    setEditFormData(formData);
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (key: string, value: string) => {
    setEditFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveEdit = async () => {
    if (!editingRow) return;

    const config = getTableConfig(tableType);
    const errors: string[] = [];

    config.columns.forEach(col => {
      const error = validateField(col.key, editFormData[col.key], col.type);
      if (error) {
        errors.push(`${col.label}: ${error}`);
      }
    });

    if (errors.length > 0) {
      toast({
        title: "Erro de validação",
        description: errors.join(', '),
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData = { ...editFormData };
      delete updateData.id;
      delete updateData.user_id;

      config.columns.forEach(col => {
        if ((col.type === 'number' || col.type === 'currency') && updateData[col.key]) {
          updateData[col.key] = Number(updateData[col.key]);
        }
      });

      const { error } = await supabase
        .from(tableType)
        .update(updateData)
        .eq('id', editingRow.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Registro atualizado com sucesso!",
      });

      setIsEditDialogOpen(false);
      setEditingRow(null);
      
      if (onDataUpdate) {
        onDataUpdate();
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o registro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (row: any) => {
    console.log('Iniciando exclusão do registro:', row);
    console.log('ID do registro:', row.id);
    console.log('Tipo do ID:', typeof row.id);
    setDeleteRowId(row.id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteRowId) {
      console.error('Nenhum ID de registro para excluir');
      return;
    }

    console.log('Confirmando exclusão do registro com ID:', deleteRowId);
    console.log('Tipo da tabela:', tableType);
    console.log('Tipo do deleteRowId:', typeof deleteRowId);

    setIsSubmitting(true);

    try {
      // Primeiro, verificamos se o registro existe antes de tentar excluir
      console.log('Verificando se o registro existe...');
      const { data: existingRecord, error: checkError } = await supabase
        .from(tableType)
        .select('id')
        .eq('id', deleteRowId)
        .single();

      console.log('Registro existente:', existingRecord);
      console.log('Erro na verificação:', checkError);

      if (checkError || !existingRecord) {
        console.warn('Registro não encontrado na verificação');
        toast({
          title: "Erro",
          description: "Registro não encontrado. Pode ter sido excluído por outro usuário.",
          variant: "destructive"
        });
        setIsDeleteDialogOpen(false);
        setDeleteRowId(null);
        if (onDataUpdate) {
          onDataUpdate();
        }
        return;
      }

      // Se o registro existe, prosseguimos com a exclusão
      console.log('Executando exclusão do registro...');
      const { error } = await supabase
        .from(tableType)
        .delete()
        .eq('id', deleteRowId);

      console.log('Erro da exclusão:', error);

      if (error) {
        console.error('Erro no Supabase:', error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Registro excluído com sucesso!",
      });

      setIsDeleteDialogOpen(false);
      setDeleteRowId(null);
      
      if (onDataUpdate) {
        console.log('Chamando onDataUpdate após exclusão');
        onDataUpdate();
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o registro. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const config = getTableConfig(tableType);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Erro ao carregar dados: {error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum registro encontrado</h3>
        <p className="text-gray-600">Não há dados para exibir no período selecionado.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {config.columns.map((column) => (
                <TableHead key={column.key}>{column.label}</TableHead>
              ))}
              {!isCollaborator && <TableHead className="text-right">Ações</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={row.id || index}>
                {config.columns.map((column) => (
                  <TableCell key={column.key}>
                    {formatValue(row[column.key], column.type, column.suffix)}
                  </TableCell>
                ))}
                {!isCollaborator && (
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(row)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(row)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog - Only show for producers */}
      {!isCollaborator && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Editar {config.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {config.columns.map((column) => (
                <div key={column.key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {column.label}
                  </label>
                  <Input
                    type={column.type === 'date' ? 'date' : column.type === 'number' || column.type === 'currency' ? 'number' : 'text'}
                    value={editFormData[column.key] || ''}
                    onChange={(e) => handleInputChange(column.key, e.target.value)}
                    step={column.type === 'currency' ? '0.01' : column.type === 'number' ? '0.001' : undefined}
                    min={column.type === 'number' || column.type === 'currency' ? '0' : undefined}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSubmitting}>
                {isSubmitting ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog - Only show for producers */}
      {!isCollaborator && (
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza de que deseja excluir este registro? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction 
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? 'Excluindo...' : 'Excluir'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
};
