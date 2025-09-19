import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { decryptPassword, encryptPassword } from "../utils/crypto";
import {
  loadPasswordRecords,
  PasswordRecord,
  persistPasswordRecords,
} from "../storage/passwordStorage";

const Home: React.FC = () => {
  const [records, setRecords] = useState<PasswordRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [label, setLabel] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [masterKey, setMasterKey] = useState("");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const storedRecords = await loadPasswordRecords();
        setRecords(storedRecords);
      } catch (error) {
        console.error("Unable to load stored passwords", error);
        setErrorMessage("No se pudieron cargar las contraseñas guardadas.");
      } finally {
        setLoading(false);
      }
    };

    void loadRecords();
  }, []);

  const resetFeedback = () => {
    setErrorMessage(null);
    setInfoMessage(null);
  };

  const clearForm = () => {
    setLabel("");
    setUsername("");
    setPassword("");
  };

  const handleAddPassword = useCallback(async () => {
    resetFeedback();

    if (!label.trim() || !username.trim() || !password.trim()) {
      setErrorMessage("Todos los campos son obligatorios.");
      return;
    }

    if (!masterKey.trim()) {
      setErrorMessage("Debes indicar una clave maestra para cifrar la contraseña.");
      return;
    }

    try {
      const encryptedPassword = encryptPassword(password.trim(), masterKey.trim());

      const newRecord: PasswordRecord = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        label: label.trim(),
        username: username.trim(),
        encryptedPassword,
        createdAt: new Date().toISOString(),
      };

      const updatedRecords = [...records, newRecord];
      await persistPasswordRecords(updatedRecords);
      setRecords(updatedRecords);
      clearForm();
      setInfoMessage("Contraseña guardada correctamente.");
    } catch (error) {
      console.error("Error encrypting/saving password", error);
      setErrorMessage((error as Error).message);
    }
  }, [label, username, password, masterKey, records]);

  const toggleRevealPassword = useCallback(
    (record: PasswordRecord) => {
      resetFeedback();

      if (!masterKey.trim()) {
        setErrorMessage("Introduce la clave maestra para descifrar.");
        return;
      }

      setRevealedPasswords((prev) => {
        const isRevealed = Boolean(prev[record.id]);

        if (isRevealed) {
          const { [record.id]: _, ...rest } = prev;
          return rest;
        }

        try {
          const decrypted = decryptPassword(record.encryptedPassword, masterKey.trim());
          return {
            ...prev,
            [record.id]: decrypted,
          };
        } catch (error) {
          console.error("Failed to decrypt password", error);
          setErrorMessage("No se pudo descifrar la contraseña con la clave indicada.");
          return prev;
        }
      });
    },
    [masterKey],
  );

  const renderRecordItem = useCallback(
    ({ item }: { item: PasswordRecord }) => {
      const isRevealed = Boolean(revealedPasswords[item.id]);
      const createdAt = new Date(item.createdAt);

      return (
        <View style={styles.recordRow}>
          <View style={styles.recordCellWide}>
            <Text style={styles.recordLabel}>{item.label}</Text>
            <Text style={styles.recordMeta}>{item.username}</Text>
            <Text style={styles.recordMeta}>
              {createdAt.toLocaleString()}
            </Text>
          </View>
          <View style={styles.recordCellPassword}>
            <Text style={styles.recordPasswordText}>
              {isRevealed ? revealedPasswords[item.id] : "••••••••"}
            </Text>
            <TouchableOpacity
              onPress={() => toggleRevealPassword(item)}
              style={styles.revealButton}
            >
              <Text style={styles.revealButtonText}>{isRevealed ? "Ocultar" : "Ver"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    },
    [revealedPasswords, toggleRevealPassword],
  );

  const listHeader = (
    <View style={styles.formContainer}>
      <Text style={styles.sectionTitle}>Nueva contraseña</Text>

      <TextInput
        value={masterKey}
        onChangeText={setMasterKey}
        placeholder="Clave maestra"
        style={styles.input}
        secureTextEntry
      />

      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="Nombre del sitio o servicio"
        style={styles.input}
      />

      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Usuario"
        style={styles.input}
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña"
        secureTextEntry
        style={styles.input}
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}

      <TouchableOpacity onPress={handleAddPassword} style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Guardar contraseña</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Contraseñas guardadas</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#0f62fe" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderRecordItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>
            Aún no has guardado ninguna contraseña.
          </Text>
        }
        contentContainerStyle={
          records.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f2f4f8",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    marginBottom: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#dde1e6",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  submitButton: {
    backgroundColor: "#0f62fe",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  errorText: {
    color: "#da1e28",
    marginBottom: 8,
  },
  infoText: {
    color: "#198038",
    marginBottom: 8,
  },
  listContainer: {
    paddingBottom: 32,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 32,
  },
  emptyMessage: {
    textAlign: "center",
    color: "#697077",
    fontSize: 16,
  },
  recordRow: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  recordCellWide: {
    flex: 3,
  },
  recordCellPassword: {
    flex: 2,
    alignItems: "flex-end",
  },
  recordLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  recordMeta: {
    fontSize: 14,
    color: "#525252",
  },
  recordPasswordText: {
    fontSize: 16,
    fontFamily: "Courier",
    marginBottom: 8,
  },
  revealButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#e0e7ff",
  },
  revealButtonText: {
    fontWeight: "600",
    color: "#1f3c88",
  },
});

export default Home;
