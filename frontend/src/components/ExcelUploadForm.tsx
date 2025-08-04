import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserSession } from '@/hooks/useUserSession';
import { useCollaboratorSession } from '@/hooks/useCollaboratorSession';
import { supabase } from '@/integrations/supabase/client';


interface ErrorMessage {
  linha: Record<string, any>;
  erros: string[];
}

interface ApiErrorResponse {
  erro: boolean;
  mensagens: ErrorMessage[];
}

interface ApiSimpleErrorResponse {
  erro: boolean;
  mensagem: string;
}

const ExcelUploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const { toast } = useToast();
  const { userId } = useUserSession();
  const { isCollaborator, collaboratorData } = useCollaboratorSession();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    setFileName(selectedFile ? selectedFile.name : "");
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx')) {
        toast({
          title: "Formato inválido",
          description: "Por favor, selecione apenas arquivos .xlsx",
          variant: "destructive"
        });
        return;
      }
      setFile(selectedFile);
      setErrors([]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!file) {
      toast({
        title: "Arquivo obrigatório",
        description: "Por favor, selecione um arquivo Excel para enviar",
        variant: "destructive"
      });
      return;
    }

    // Validar se o userId está disponível SEMPRE
    if (!userId && !isCollaborator) {
      toast({
        title: "Usuário não identificado",
        description: "Por favor, faça login para enviar arquivos",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    setErrors([]);

    try {
      const formData = new FormData();
      formData.append('data', file);
      
     if (isCollaborator && collaboratorData) {
        const { data: producer, error } = await supabase
          .from('usuario')
          .select('user_id')
          .eq('id', collaboratorData.produtorId)
          .limit(1)
          .single();
      
        if (error || !producer) {
          toast({
            title: "Erro",
            description: "Não foi possível identificar o produtor vinculado",
            variant: "destructive"
          });
          setIsUploading(false);
          return;
        }
      
        formData.append('user_id', producer.user_id);
        formData.append('registrado_por', collaboratorData.username);
      } else {
        formData.append('user_id', userId!);
      }


      console.log('Enviando arquivo para API...');
      console.log('Tipo de usuário:', isCollaborator ? 'Colaborador' : 'Produtor');
      console.log('FormData conteúdo:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      const response = await fetch('https://api.teste.onlinecenter.com.br/webhook/excel-upload', {
        method: 'POST',
        body: formData,
      });

      console.log('Status da resposta:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('Resposta de sucesso:', result);
        toast({
          title: "✅ Sucesso!",
          description: result.mensagem || result.message || "Dados enviados com sucesso!",
        });
        setFile(null);
        setFileName("");
        const fileInput = document.getElementById('excel-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const responseText = await response.text();
        console.log('Resposta de erro (texto):', responseText);
        
        let errorData: any;
        try {
          errorData = JSON.parse(responseText);
          console.log('Resposta de erro (JSON parseado):', errorData);
          console.log('Tipo da resposta:', typeof errorData);
          console.log('É array?', Array.isArray(errorData));
          console.log('Conteúdo completo:', JSON.stringify(errorData, null, 2));
        } catch (parseError) {
          console.error('Erro ao fazer parse do JSON:', parseError);
          toast({
            title: "Erro no envio",
            description: "Resposta da API inválida. Tente novamente.",
            variant: "destructive"
          });
          return;
        }
        
        if (Array.isArray(errorData) && errorData.length > 0) {
          console.log('É um array com erro - Primeiro item:', errorData[0]);
          if (errorData[0]?.erro && errorData[0]?.mensagem) {
            console.log('Mensagem extraída do array:', errorData[0].mensagem);
            toast({
              title: "Erro no envio",
              description: errorData[0].mensagem,
              variant: "destructive"
            });
            return;
          }
        }
        
        if (errorData?.erro && errorData?.mensagem) {
          console.log('É um objeto simples com erro - Mensagem:', errorData.mensagem);
          toast({
            title: "Erro no envio",
            description: errorData.mensagem,
            variant: "destructive"
          });
          return;
        }
        
        if (errorData?.erro && errorData?.mensagens) {
          console.log('É um objeto com mensagens de validação:', errorData.mensagens);
          setErrors(errorData.mensagens);
          return;
        }
        
        console.log('Formato de erro não reconhecido - Resposta completa:', errorData);
        toast({
          title: "Erro no envio",
          description: `Erro: ${JSON.stringify(errorData)}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast({
        title: "Erro no envio",
        description: "Falha ao enviar o arquivo. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const formatTypes = [
    {
      title: "🌱 Plantio",
      color: "border-emerald-200 bg-emerald-50",
      fields: [
        { name: "cultura", type: "texto", required: true },
        { name: "data_plantio", type: "DD/MM/AAAA", required: true },
        { name: "area_plantada", type: "número", required: true }
      ]
    },
    {
      title: "🧺 Colheita", 
      color: "border-orange-200 bg-orange-50",
      fields: [
        { name: "cultura", type: "texto", required: true },
        { name: "data_colheita", type: "DD/MM/AAAA", required: true },
        { name: "quantidade", type: "número", required: true }
      ]
    },
    {
      title: "🛒 Venda",
      color: "border-blue-200 bg-blue-50", 
      fields: [
        { name: "cultura", type: "texto", required: true },
        { name: "data_venda", type: "DD/MM/AAAA", required: true },
        { name: "quantidade", type: "número", required: true },
        { name: "valor_total", type: "número", required: true }
      ]
    },
    {
      title: "💰 Gasto",
      color: "border-red-200 bg-red-50",
      fields: [
        { name: "tipo_gasto", type: "texto", required: true },
        { name: "data", type: "DD/MM/AAAA", required: true },
        { name: "valor", type: "número", required: true },
        { name: "descricao", type: "texto", required: false }
      ]
    },
    {
      title: "🧪 Insumo",
      color: "border-purple-200 bg-purple-50",
      fields: [
        { name: "nome", type: "texto", required: true },
        { name: "tipo", type: "texto", required: false },
        { name: "quantidade", type: "número", required: true },
        { name: "preco_unitario", type: "número", required: true }
      ]
    },
    {
      title: "👨‍🌾 Trabalho",
      color: "border-indigo-200 bg-indigo-50",
      fields: [
        { name: "descricao", type: "texto", required: true },
        { name: "responsavel", type: "texto", required: false },
        { name: "custo", type: "número", required: false }
      ]
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-emerald-100 rounded-full">
            <FileSpreadsheet className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Upload de Planilha Excel</h1>
        <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-2">
          Envie uma planilha com os dados de Plantio, Colheita, Venda, Gasto, Insumo ou Trabalho
        </p>
        {isCollaborator && collaboratorData && (
          <p className="text-sm text-emerald-600 mt-2">
            Colaborador: {collaboratorData.username}
          </p>
        )}
      </div>

      {/* Upload Form */}
      <Card className="w-full shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-center gap-2 text-base sm:text-lg lg:text-xl">
            <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            Selecionar Arquivo
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Escolha um arquivo Excel (.xlsx) com os dados rurais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* File Input Section */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <label htmlFor="excel-file" className="block text-sm font-medium text-gray-700 text-center">
                  Arquivo Excel (.xlsx)
                </label>

                <div className="w-full">
                  <label htmlFor="excel-file" className="relative block w-full cursor-pointer">
                    <input
                      id="excel-file"
                      type="file"
                      accept=".xlsx"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    
                    <div className="h-10 sm:h-12 bg-background flex items-center justify-center px-2 sm:px-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-400 transition-colors">
                      <span className="text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg py-2 px-3 mr-2 whitespace-nowrap">
                        Escolher arquivo
                      </span>
                      <span className="text-sm text-gray-500 truncate">
                        {fileName || 'Nenhum arquivo selecionado'}
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              {file && (
                <Alert className="border-emerald-200 bg-emerald-50">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <AlertDescription className="text-emerald-800">
                    <strong>Arquivo selecionado:</strong> 
                    <span className="block sm:inline mt-1 sm:mt-0 sm:ml-1 break-all">{file.name}</span>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Formatos Aceitos Section */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">📋 Formatos Aceitos</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {formatTypes.map((format, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${format.color}`}>
                    <h4 className="font-semibold text-gray-800 mb-2 text-sm">{format.title}</h4>
                    <div className="space-y-1">
                      {format.fields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-700 truncate flex-1">{field.name}</span>
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-gray-500">({field.type})</span>
                            <span className={field.required ? "text-red-500" : "text-gray-400"}>
                              {field.required ? "*" : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit" 
                disabled={!file || isUploading || (!userId && !isCollaborator)}
                className="w-full sm:w-auto sm:min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>📤 Enviar Planilha</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Error Messages */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-3">
              <p className="font-semibold">❌ Erros encontrados na planilha:</p>
              {errors.map((error, index) => (
                <div key={index} className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-800 mb-2">Linha {index + 1}:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {error.erros.map((erro, errorIndex) => (
                      <li key={errorIndex} className="text-sm text-red-700">{erro}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ExcelUploadForm;
