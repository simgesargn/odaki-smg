import React from "react";
import { Modal, View, StyleSheet, FlatList, Pressable } from "react-native";
import { Text } from "../ui/Text";

const EMOJIS = ["🙂","😄","😎","🔥","🌱","🪷","🌻","🌸","💪","✨","🧠","📚","🎯","🏆"];

export const AvatarPickerModal: React.FC<{ visible: boolean; onClose: ()=>void; onPick: (e:string)=>void }> = ({ visible, onClose, onPick }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.card}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontWeight: "700" }}>Avatar Seç</Text>
            <Pressable onPress={onClose}><Text variant="muted">Kapat</Text></Pressable>
          </View>
          <FlatList data={EMOJIS} keyExtractor={(i)=>i} numColumns={6} contentContainerStyle={{ marginTop: 12 }} renderItem={({item})=>(
            <Pressable style={s.emojiBtn} onPress={()=>{ onPick(item); }}>
              <Text style={{ fontSize: 28 }}>{item}</Text>
            </Pressable>
          )} />
          <Text variant="muted" style={{ marginTop: 8 }}>Gerçek fotoğraf Premium’da</Text>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: { flex:1, justifyContent:"flex-end", backgroundColor:"rgba(0,0,0,0.35)" },
  card: { backgroundColor:"#fff", padding:16, borderTopLeftRadius:12, borderTopRightRadius:12, maxHeight:420 },
  emojiBtn: { width:"16.66%", padding:10, alignItems:"center", justifyContent:"center" }
});
